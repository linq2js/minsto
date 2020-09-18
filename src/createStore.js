import createArrayKeyedMap from "./createArrayKeyedMap";
import createEmitter from "./createEmitter";
import createMatcher from "./createMatcher";
import createSelector from "./createSelector";
import createTask from "./createTask";
import ErrorWrapper from "./ErrorWrapper";
import isEqual from "./isEqual";
import isPromiseLike from "./isPromiseLike";
import Loadable from "./Loadable";
import { dispatchContext, selectContext } from "./storeContext";
import ValueWrapper from "./ValueWrapper";

const undefinedLoadable = new Loadable();

export default function createStore(model = {}, options = {}) {
  const { parentStore } = options;
  const emitter = createEmitter();
  const selectors = {};
  const loadables = {};
  const children = {};
  const defaultCallbackCache = createArrayKeyedMap();
  let state = {};
  let notifyChangeTimerId;
  let loading = false;
  let loadingPromise;
  let loadingError;
  const store = {
    when,
    watch,
    getState,
    getPlugins,
    dispatch,
    onChange,
    onDispatch,
    $,
    mutate,
    // compatible with redux
    subscribe,
    callback: createCallback,
    get loading() {
      return loading;
    },
    get error() {
      return loadingError;
    },
  };

  if (model.state) {
    Object.entries(model.state).forEach(([propName, defaultValue]) => {
      state[propName] =
        defaultValue instanceof ValueWrapper
          ? defaultValue.value
          : defaultValue;
      const get = () => {
        const sc = selectContext();
        if (sc) {
          if (loading) {
            if (loadingError) throw loadingError;
            throw loadingPromise;
          }
          const loadable = loadables[propName];
          if (loadable) {
            if (loadable.loading) throw loadable.promise;
            if (loadable.hasError) throw loadable.error;
          }
        }
        return state[propName];
      };
      selectors["$" + propName] = get;
      Object.defineProperty(store, propName, {
        get,
        set(value) {
          mutate(propName, value);
        },
        enumerable: true,
      });
    });
  }

  if (model.computed) {
    Object.entries(model.computed).forEach(([propName, computedProp]) => {
      const selector = createSelector(computedProp, selectors);
      selectors[propName] = selector;
      defProp(store, propName, () => selector(state), true);
    });
  }

  if (model.listeners) {
    when(model.listeners);
  }

  if (model.actions) {
    Object.entries(model.actions).forEach(([actionName, actionBody]) => {
      let last;
      const dispatcher = (payload) => {
        const task = createTask({ last });
        last = task;
        return task.call(
          dispatch,
          {
            actionType: actionBody.displayName || actionBody.name || actionName,
            actionBody,
          },
          payload
        );
      };
      defProp(store, actionName, dispatcher, false);
    });
  }

  if (model.children) {
    Object.entries(model.children).forEach(([childName, childModel]) => {
      const pluginStore = createStore(childModel, { parentStore: store });
      children[childName] = pluginStore;
      // child store is isolated if its name starts with $ (this can be controlled by parent store)
      // or its model.isolate is true (this can be controlled by store factory util)
      const isolate = childName.charAt(0) === "$" || childModel.isolate;
      if (!isolate) {
        state[childName] = pluginStore.getState();
        pluginStore.onChange(() => {
          const pluginState = pluginStore.getState();
          mutate(childName, pluginState);
        });
      }
      defProp(store, childName, pluginStore, false);
    });
  }

  if (model.init) {
    const initResult = model.init(store, parentStore);
    if (isPromiseLike(initResult)) {
      loading = true;
      loadingPromise = initResult.then(
        () => {
          loading = false;
          loadingPromise = undefined;
          emitter.emitOnce("ready");
        },
        (error) => {
          loadingError = error;
          emitter.emitOnce("error", error);
        }
      );
    }
  } else {
    emitter.emitOnce("ready");
  }

  function notifyChange() {
    const dc = dispatchContext();
    if (dc) {
      dc.notifyChanges.add(notifyChange);
    } else {
      emitter.emit("change", { store, state });
    }
  }

  function getState() {
    return state;
  }

  function getPlugins() {
    return children;
  }

  function loadableOf(prop) {
    let loadable = loadables[prop];
    if (!loadable) {
      if (prop in state) {
        loadables[prop] = loadable = new Loadable(state[prop]);
      } else {
        loadables[prop] = loadable = undefinedLoadable;
      }
    }
    return loadable;
  }

  function $(prop, value) {
    // getter
    if (arguments.length < 2) {
      return prop in loadables ? loadables[prop].value : state[prop];
    }
    if (typeof value === "function") {
      value = value(state[prop], loadableOf(prop));
    }
    // setter
    if (isPromiseLike(value)) {
      const promise = value;
      if (prop in loadables && loadables[prop].promise === promise) return;
      const loadable = (loadables[prop] = new Loadable(promise));

      promise.then(
        (payload) => {
          if (loadables[prop] !== loadable) return;
          if (prop in state) {
            mutate(prop, payload);
          } else {
            loadables[prop] = new Loadable(payload);
            debouncedNotifyChange();
          }
        },
        (error) => {
          if (loadables[prop] !== loadable) return;
          loadables[prop] = new Loadable(new ErrorWrapper(error));
          debouncedNotifyChange();
        }
      );
      notifyChange();
    } else if (prop in state) {
      mutate(prop, value);
    } else {
      if (prop in loadables && loadables[prop].value === value) return;
      loadables[prop] = new Loadable(value);
      notifyChange();
    }
  }

  function debouncedNotifyChange() {
    clearTimeout(notifyChangeTimerId);
    setTimeout(notifyChange, notifyChangeTimerId);
  }

  function createCallback(callback, ...keys) {
    const sc = selectContext();
    const cache = sc ? sc.cache : defaultCallbackCache;
    return cache.getOrAdd(keys, () => (...args) => callback(...args));
  }

  function mutate(prop, value) {
    delete loadables[prop];

    const prev = state[prop];
    if (value instanceof ValueWrapper) {
      value = value.value;
    } else if (typeof value === "function") {
      value = value(prev);
    }
    if (prev !== value) {
      state = { ...state, [prop]: value };
      notifyChange();
    }
  }

  function when(event, callback) {
    const hasCallback = arguments.length > 1;
    if (hasCallback && callback) {
      callback = wrapListener(callback);
    }

    if (event === "#change") {
      return emitter.on("change", callback);
    }
    if (event === "#dispatch") {
      return emitter.on("dispatch", callback);
    }
    if (event === "#error") {
      return emitter.on("error", callback);
    }
    let unsubscribes = [];

    function cancel() {
      unsubscribes.forEach((x) => x());
    }

    if (!hasCallback) {
      const promise = new Promise((resolve) => {
        unsubscribes.push(
          addListener(event, (args) => {
            cancel();
            resolve(args.payload);
          })
        );
      });
      promise.cancel = cancel;
      return promise;
    }

    if (typeof event === "object" && !Array.isArray(event)) {
      unsubscribes.push(
        ...Object.entries(event).map(([key, value]) => when(key, value))
      );
      return cancel;
    }

    unsubscribes.push(addListener(event, callback));
    return cancel;
  }

  function addListener(event, callback) {
    const matchers = (Array.isArray(event) ? event : [event]).map(
      createEventMatcher
    );
    return emitter.on("dispatch", (args) => {
      if (matchers.some((matcher) => matcher(args.action))) {
        return callback(args);
      }
    });
  }

  function dispatch(action, payload) {
    let dc = dispatchContext();
    if (!dc) {
      dispatchContext(
        (dc = {
          scopes: 0,
          notifyChanges: new Set(),
        })
      );
    }
    dc.scopes++;
    let actionType;
    try {
      if (typeof action === "function") {
        actionType = action.actionType || action.displayName || action.name;
        return action(store, payload);
      } else if (typeof action === "object") {
        if (arguments.length > 1) {
          actionType = action.actionType;
          return action.actionBody(store, payload);
        } else {
          // redux compatible
          const { type, payload } = action;
          return store[type](payload);
        }
      }
    } finally {
      dc.scopes--;
      if (!dc.scopes) {
        dispatchContext(undefined);
        dc.notifyChanges.forEach((x) => x());
      }
      emitter.emit("dispatch", { type: actionType, payload, store });
    }
  }

  function watch(selector, callback) {
    if (Array.isArray(selector)) {
      const props = selector;
      selector = (state) => {
        const result = {};
        props.forEach((prop) => (result[prop] = state[prop]));
        return result;
      };
    } else if (typeof selector === "string") {
      const prop = selector;
      selector = (state) => state[prop];
    }
    let previous = selector(state);
    return emitter.on("change", (args) => {
      const current = selector(state);
      if (isEqual(current, previous)) return;
      const newArgs = { ...args, current, previous };
      previous = current;
      callback(newArgs);
    });
  }

  function onChange(listener) {
    return emitter.on("change", wrapListener(listener));
  }

  function wrapListener(listener) {
    if (listener.__wraped === true) return listener;
    let last;
    const wrapper = (args) => {
      const task = createTask({ last });
      last = task;
      return task.call(listener, args, task);
    };
    wrapper.__wraped = true;
    return wrapper;
  }

  function onDispatch(listener) {
    return emitter.on("dispatch", wrapListener(listener));
  }

  function subscribe(subscription) {
    return onDispatch(subscription);
  }

  return store;
}

function defProp(target, name, value, enumerable) {
  Object.defineProperty(target, name, { value, enumerable });
}

function createEventMatcher(event) {
  if (typeof event === "string") return createMatcher(event);
  if (typeof event === "function")
    return createMatcher(event.displayName || event.name);
  throw new Error("Invalid event type");
}

function deepCloneObject(obj) {
  const result = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (Array.isArray(value) || typeof value !== "object") {
      result[key] = value;
    } else {
      result[key] = deepCloneObject(value);
    }
  });
  return result;
}
