import createEmitter from "./createEmitter";
import createSelector from "./createSelector";
import { dispatchContext, selectContext } from "./storeContext";
import createMatcher from "./createMatcher";
import isEqual from "./isEqual";
import isPromiseLike from "./isPromiseLike";
import ErrorWrapper from "./ErrorWrapper";

export default function minsto(model = {}, options = {}) {
  const { parentStore } = options;
  const emitter = createEmitter();
  const selectors = {};
  const dynamicState = {};
  const store = {
    when,
    watch,
    getState,
    dispatch,
    onChange,
    onDispatch,
    dynamic
  };
  let state = {};
  let notifyChangeTimerId;

  if (model.state) {
    Object.entries(model.state).forEach(([propName, defaultValue]) => {
      state[propName] = defaultValue;
      const get = () => {
        const sc = selectContext();
        if (sc) {
          const dynamicValue = dynamicState[propName];
          if (isPromiseLike(dynamicValue)) throw dynamicValue;
          if (dynamicValue instanceof ErrorWrapper) throw dynamicValue.error;
        }
        return state[propName];
      };
      selectors["$" + propName] = get;
      Object.defineProperty(store, propName, {
        get,
        set(value) {
          mutate(propName, value);
        },
        enumerable: true
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
      defProp(
        store,
        actionName,
        (payload) =>
          dispatch(
            {
              actionType:
                actionBody.displayName || actionBody.name || actionName,
              actionBody
            },
            payload
          ),
        false
      );
    });
  }

  if (model.plugins) {
    Object.entries(model.plugins).forEach(([pluginName, pluginModel]) => {
      const pluginStore = minsto(pluginModel, { parentStore: store });
      pluginStore.when("@change", () => {
        const pluginState = pluginStore.getState();
        mutate(pluginName, pluginState);
      });
      defProp(store, pluginName, pluginStore, false);
    });
  }

  if (model.init) {
    model.init(store, parentStore);
  }

  function notifyChange() {
    const dc = dispatchContext();
    if (dc) {
      dc.notifyChanges.add(notifyChange);
    } else {
      emitter.emit("change", { target: store, state });
    }
  }

  function getState() {
    return state;
  }

  function dynamic(prop, value) {
    // getter
    if (arguments.length < 2) {
      return dynamicState[prop];
    }
    // setter
    if (isPromiseLike(value)) {
      if (dynamicState[prop] === value) return;
      const promise = value;
      dynamicState[prop] = promise;
      promise.then(
        (payload) => {
          if (dynamicState[prop] !== promise) return;
          if (prop in state) {
            delete dynamicState[prop];
            mutate(prop, payload);
          } else {
            dynamicState[prop] = payload;
            debouncedNotifyChange();
          }
        },
        (error) => {
          dynamicState[prop] = new ErrorWrapper(error);
          debouncedNotifyChange();
        }
      );
      notifyChange();
    } else if (prop in state) {
      delete dynamicState[prop];
      mutate(prop, value);
    } else {
      if (dynamicState[prop] === value) return;
      dynamicState[prop] = value;
      notifyChange();
    }
  }

  function debouncedNotifyChange() {
    clearTimeout(notifyChangeTimerId);
    setTimeout(notifyChange, notifyChangeTimerId);
  }

  function mutate(prop, value) {
    const prev = state[prop];
    if (typeof value === "function") {
      value = value(prev);
    }
    if (prev !== value) {
      state = { ...state, [prop]: value };
      notifyChange();
    }
  }

  function when(event, callback) {
    const hasCallback = arguments.length > 1;
    if (event === "#change") {
      return emitter.on("change", callback);
    }
    if (event === "#dispatch") {
      return emitter.on("dispatch", callback);
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
          notifyChanges: new Set()
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
        actionType = action.actionType;
        return action.actionBody(store, payload);
      }
    } finally {
      dc.scopes--;
      if (!dc.scopes) {
        dispatchContext(undefined);
        dc.notifyChanges.forEach((x) => x());
      }
      emitter.emit("dispatch", { type: actionType, payload, target: store });
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
      callback({ ...args, current, previous });
    });
  }

  function onChange(listener) {
    return emitter.on("change", listener);
  }

  function onDispatch(listener) {
    return emitter.on("dispatch", listener);
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
