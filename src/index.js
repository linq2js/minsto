import createEmitter from "./createEmitter";
import createSelector from "./createSelector";
import isEqual from "./isEqual";
import { matchAny } from "./types";

const versionProp = "@@version";
const stateProp = "@@state";

export default function (model) {
  const store = {};
  const emitter = createEmitter();

  let stateVersion = {};
  let dispatching = false;
  let state = {};

  function notifyChange() {
    emitter.emit("change", { store, state });
  }

  function subscribe(callback) {
    return emitter.on("change", callback);
  }

  function dispatch(action, payload) {
    if (!action.actionName) {
      action.actionName = action.name;
    }
    const prevState = state;
    dispatching = true;
    try {
      return action(store, payload);
    } finally {
      dispatching = false;
      if (prevState !== state) notifyChange();
      emitter.emit("dispatch", { action, payload, store });
    }
  }

  function watch(selector, callback) {
    let prev = selector(state);
    return subscribe((args) => {
      const next = selector(state);
      if (isEqual(prev, next)) return;
      prev = next;
      callback({ ...args, value: next });
    });
  }

  function when(action, callback) {
    const hasCallback = arguments.length > 1;
    const matchers = (Array.isArray(action) ? action : [action]).map((action) =>
      action === "*"
        ? matchAny
        : typeof action === "string"
        ? (target) => target.actionName === action || target.name === action
        : (target) => target === action
    );
    const matcher =
      matchers.length === 1
        ? matchers[0]
        : (action) => matchers.some((m) => m(action));
    const unsubscribe = emitter.on("dispatch", (args) => {
      if (matcher(args.action)) {
        if (!hasCallback) {
          unsubscribe();
        }
      }
      callback(args);
    });
    if (hasCallback) return unsubscribe;
    return Object.assign(new Promise((resolve) => (callback = resolve)), {
      cancel: unsubscribe,
    });
  }

  function getState() {
    return state;
  }

  function use() {
    const allSelectors = {};
    const plugin = {};
    const [prefix = "", inputModel = {}] =
      arguments.length > 1 ? arguments : [undefined, arguments[0]];
    const { init, $computed, ...model } =
      typeof inputModel === "function" ? inputModel(plugin) : inputModel;
    const entries = Object.entries(model);
    if ($computed) {
      entries.push(
        ...Object.entries($computed).map(([prop, value]) => [
          prop,
          value,
          "computed",
        ])
      );
    }
    entries.forEach(([pluginPropName, value, type]) => {
      const storePropName = prefix + pluginPropName;
      if (storePropName in store) {
        if (process.env.NODE_ENV !== "production") {
          throw new Error("Duplicated state prop: " + storePropName);
        }
        return;
      }
      if (type === "computed") {
        const selector = createSelector(value, allSelectors);
        const getter = () => selector(state);
        allSelectors[pluginPropName] = selector;
        if (pluginPropName.charAt(0) !== "_") {
          !prefix &&
            Object.defineProperty(store, storePropName, {
              get: getter,
            });
          Object.defineProperty(plugin, pluginPropName, {
            get: getter,
          });
        }
      } else if (typeof value === "function") {
        const action = Object.assign((payload) => dispatch(value, payload), {
          actionName: storePropName,
        });
        !prefix &&
          defineProps(
            store,
            {
              [storePropName]: action,
            },
            false
          );
        defineProps(
          plugin,
          {
            [pluginPropName]: action,
          },
          false
        );
      } else {
        state[storePropName] = value;
        const get = () => {
          // update version
          stateVersion = {};
          return state[storePropName];
        };
        const set = (value) => {
          if (state[storePropName] !== value) {
            // we dont want to clone state many times
            // just clone whenever state version changed
            // for example if you try to mutate multiple state props at the same time,
            // only one state cloning does
            if (state[versionProp] !== stateVersion) {
              state = { ...state };
              stateVersion = {};
              defineProps(state, { [versionProp]: stateVersion }, false);
            }
            state[storePropName] = value;
            if (!dispatching) notifyChange();
          }
        };
        const propMetadata = {
          get,
          set,
          enumerable: true,
        };
        !prefix && Object.defineProperty(store, storePropName, propMetadata);
        Object.defineProperty(plugin, pluginPropName, propMetadata);
      }
    });

    prefix && defineProps(store, { [prefix]: plugin }, false);

    typeof init === "function" && init(store);

    return store;
  }

  defineProps(store, {
    subscribe,
    dispatch,
    when,
    use,
    watch,
    getState,
    [versionProp]: { get: () => stateVersion },
  });

  use(model);

  return store;
}

function defineProps(obj, props, enumerable) {
  Object.entries(props).forEach(([prop, value]) =>
    Object.defineProperty(obj, prop, {
      value,
      enumerable,
    })
  );
}
