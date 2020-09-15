import createEmitter from "./createEmitter";
import { matchAny } from "./types";

const versionProp = "@@version";
const stateProp = "@@state";

export default function (definition) {
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

  function when(action, callback) {
    const hasCallback = arguments.length > 1;
    const matcher =
      action === "*"
        ? matchAny
        : typeof action === "string"
        ? (target) => target.actionName === action || target.name === action
        : (target) => target === action;
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
      cancel: unsubscribe
    });
  }

  function use({ init, ...definition } = {}) {
    Object.entries(definition).forEach(([prop, value]) => {
      if (prop in store) {
        if (process.env.NODE_ENV !== "production") {
          throw new Error("Duplicated state prop: " + prop);
        }
        return;
      }

      if (typeof value === "function") {
        defineProps(
          store,
          {
            [prop]: Object.assign((payload) => dispatch(value, payload), {
              actionName: prop
            })
          },
          true
        );
      } else {
        state[prop] = value;
        Object.defineProperty(store, prop, {
          get() {
            // update version
            stateVersion = {};
            return state[prop];
          },
          set(value) {
            if (state[prop] !== value) {
              // we dont want to clone state many times
              // just clone whenever state version changed
              // for example if you try to mutate multiple state props at the same time,
              // only one state cloning does
              if (state[versionProp] !== stateVersion) {
                state = { ...state };
                stateVersion = {};
                defineProps(state, { [versionProp]: stateVersion }, false);
              }
              state[prop] = value;
              if (!dispatching) notifyChange();
            }
          },
          enumerable: true
        });
      }
    });

    typeof init === "function" && init(store);

    return store;
  }

  defineProps(store, {
    subscribe,
    dispatch,
    when,
    use,
    [versionProp]: { get: () => stateVersion },
    [stateProp]: {
      get() {
        // update version
        stateVersion = {};
        return state;
      }
    }
  });

  use(definition);

  return store;
}

function defineProps(obj, props, enumerable) {
  Object.entries(props).forEach(([prop, value]) =>
    Object.defineProperty(obj, prop, {
      value,
      enumerable
    })
  );
}
