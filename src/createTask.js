import createEmitter from "./createEmitter";
import isPromiseLike from "./isPromiseLike";
import { noop } from "./types";

export default function createTask({ last, parent, start } = {}) {
  const emitter = createEmitter();
  const onCancel = emitter.get("cancel").on;
  const onDispose = emitter.get("dispose").on;
  const props = {
    cancelled: false,
  };
  const task = {
    cancelled,
    cancel,
    disposed,
    dispose,
    wrap,
    delay,
    latest,
    debounce,
    call,
    create,
    onCancel,
    onDispose,
    all,
    race,
  };

  function latest() {
    last && last.cancel();
    last = undefined;
  }

  function debounce(ms) {
    latest();
    return delay(ms);
  }

  function dispose() {
    if (props.disposed) return;
    props.disposed = true;
    try {
      emitter.emitOnce("disposed");
    } finally {
      emitter.clear();
    }
  }

  function disposed() {
    return props.disposed;
  }

  function create(start) {
    return createTask({
      parent: task,
      start(subTask) {
        onCancel(subTask.cancel);
        return start ? start(subTask) : subTask;
      },
    });
  }

  function delay(ms, fn = noop) {
    return create(({ cancel, onCancel }) => {
      let timerId;
      return Object.assign(
        new Promise((resolve) => {
          timerId = setTimeout(resolve, ms);
          onCancel(() => {
            clearTimeout(timerId);
          });
        }).then(() => {
          if (typeof fn === "function") return fn();
          return fn;
        }),
        {
          cancel,
        }
      );
    });
  }

  function cancel() {
    if (props.cancelled) return;
    props.cancelled = true;
    emitter.emitOnce("cancel");
    dispose();
  }

  function cancelled() {
    return props.cancelled || (parent && parent.cancelled());
  }

  function wrap(target, argIndex = -1) {
    if (typeof target === "function") {
      return function () {
        const args = [...arguments];
        if (argIndex !== -1) args[argIndex] = task;
        return call(target, ...args);
      };
    }
    if (target.cancel) onCancel(target.cancel);

    return create(({ cancel, cancelled, dispose, disposed }) => {
      const promise = new Promise((resolve, reject) => {
        target.then(
          (payload) => {
            if (cancelled()) return;
            resolve(payload);
          },
          (error) => {
            if (cancelled()) return;
            if (error instanceof CancelledError) return;
            reject(error);
          }
        );
      });

      function extend(promise) {
        const { then: $then, finally: $finally, catch: $catch } = promise;
        return Object.assign(promise, {
          cancel,
          cancelled,
          dispose,
          disposed,
          then() {
            return extend($then.apply(promise, arguments));
          },
          catch() {
            return extend($catch.apply(promise, arguments));
          },
          finally() {
            return extend($finally.apply(promise, arguments));
          },
        });
      }

      return extend(promise);
    });
  }

  function call(fn, ...args) {
    if (cancelled()) throw new CancelledError();
    const result = fn(...args);
    if (isPromiseLike(result)) return wrap(result);
    return result;
  }

  function all(targets, callback) {
    return create((subTask) => {
      const wrappedCallback = callback && subTask.wrap(callback);
      subTask.onCancel(() =>
        targets.forEach((target) => target.cancel && target.cancel())
      );
      const promise = subTask.wrap(Promise.all(targets)).then((results) => {
        wrappedCallback && wrappedCallback(results, subTask);
        return results;
      });
      promise.cancel = subTask.cancel;
      return promise;
    });
  }

  function race(targets, callback) {
    return create((subTask) => {
      const wrappedCallback = callback && subTask.wrap(callback);
      const targetEntries = Object.entries(targets);
      const targetPromises = targetEntries.map(([key, target]) =>
        subTask.wrap(target).then((value, index) => ({ key, value, index }))
      );
      const cleanup = (index = -1) => {
        targetEntries.forEach(([, target], i) => {
          if (i === index) {
            target.cancel && target.cancel();
          } else {
            target.dispose && target.dispose();
          }
        });
      };
      subTask.onCancel(() => cleanup(-1));

      const promise = subTask
        .wrap(Promise.race(targetPromises))
        .then(({ key, value, index }) => {
          // cleanup others
          cleanup(index);
          const result = { [key]: value };
          wrappedCallback && wrappedCallback(result, subTask);
          return result;
        });
      promise.cancel = subTask.cancel;
      return promise;
    });
  }

  return start ? start(task) : task;
}

class CancelledError extends Error {}
