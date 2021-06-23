import { noop } from "./types";

export default function createEmitter() {
  let all = {};

  function get(event) {
    if (event in all) {
      return all[event];
    }
    let listeners = [];
    let readonlyListeners = listeners;
    let lastPayload;
    let sealed = false;

    function on(listener) {
      if (sealed) {
        listener(lastPayload);
        return noop;
      }
      let isActive = true;

      listeners = listeners.concat(listener);

      return () => {
        if (!isActive) {
          return;
        }
        isActive = false;
        const index = listeners.indexOf(listener);
        if (index !== -1) {
          if (listeners === readonlyListeners) {
            listeners = listeners.slice();
          }
          listeners.splice(index, 1);
        }
      };
    }

    function length() {
      return listeners.length;
    }

    function notify(payload) {
      try {
        const tempListeners = (readonlyListeners = listeners);
        const length = tempListeners.length;
        for (let i = 0; i < length; i++) {
          tempListeners[i](payload);
        }
      } finally {
        readonlyListeners = listeners;
      }
    }

    function emit(payload) {
      if (sealed) return;
      notify(payload);
    }

    function clear() {
      listeners = [];
    }

    function once(listener) {
      const remove = on(function () {
        remove();
        return listener.apply(this, arguments);
      });
      return remove;
    }

    function emitOnce(payload) {
      if (sealed) return;
      sealed = true;
      lastPayload = payload;
      notify(payload);
      clear();
    }

    return (all[event] = {
      on,
      emit,
      emitOnce,
      clear,
      once,
      length,
    });
  }

  function on(event, listener = noop) {
    return get(event).on(listener);
  }

  function emit(event, payload) {
    return get(event).emit(payload);
  }

  function emitOnce(event, payload) {
    return get(event).emitOnce(payload);
  }

  function once(event, listener = noop) {
    return get(event).once(listener);
  }

  function has(event) {
    return all[event] && all[event].length();
  }

  return {
    on,
    once,
    emit,
    emitOnce,
    get,
    has,
    clear(event) {
      if (event) {
        // clear specified event listeners
        get(event).clear();
        delete all[event];
      } else {
        // clear all event listeners
        all = {};
      }
    },
  };
}
