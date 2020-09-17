import { noop } from "./types";

export default function createEmitter() {
  let all = {};

  function get(event) {
    if (event in all) {
      return all[event];
    }
    let modifiedListeners;
    let workingListeners = [];
    let lastPayload;
    let sealed = false;
    let isEmitting = false;

    function makeImmutableListeners() {
      if (!isEmitting) return workingListeners;

      if (!modifiedListeners) {
        modifiedListeners = workingListeners.slice(0);
      }
      return modifiedListeners;
    }

    function on(listener) {
      if (sealed) {
        listener(lastPayload);
        return noop;
      }
      let isActive = true;

      makeImmutableListeners().push(listener);

      return () => {
        if (!isActive) {
          return;
        }
        isActive = false;
        const immutableListeners = makeImmutableListeners();
        const index = immutableListeners.indexOf(listener);
        index !== -1 && immutableListeners.splice(index, 1);
      };
    }

    function length() {
      return getListeners().length;
    }

    function getListeners() {
      return modifiedListeners || workingListeners;
    }

    function notify(payload) {
      try {
        isEmitting = true;
        // update listeners
        if (modifiedListeners) {
          workingListeners = modifiedListeners;
        }
        workingListeners.forEach((listener) => listener(payload));
      } finally {
        isEmitting = false;
      }
    }

    function emit(payload) {
      if (sealed) return;
      notify(payload);
    }

    function clear() {
      if (isEmitting) {
        makeImmutableListeners().length = 0;
      } else {
        if (modifiedListeners) modifiedListeners.length = 0;
        workingListeners.length = 0;
      }
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
