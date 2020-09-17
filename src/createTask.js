import createEmitter from "./createEmitter";
import isPromiseLike from "./isPromiseLike";
import { noop } from "./types";

export default function createTask({ last, parent, start } = {}) {
  const emitter = createEmitter();
  const onCancel = emitter.get("cancel").on;
  const props = {
    cancelled: false,
  };
  const task = {
    cancelled,
    cancel,
    wrap,
    delay,
    latest,
    call,
    create,
    onCancel,
  };

  function latest() {
    last && last.cancel();
    last = undefined;
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
        }).then(fn),
        {
          cancel,
        }
      );
    });
  }

  function cancel() {
    if (props.cancelled) return;
    props.cancelled = true;
    emitter.emit("cancel");
  }

  function cancelled() {
    return props.cancelled || (parent && parent.cancelled());
  }

  function wrap(target) {
    if (typeof target === "function") {
      return function () {
        return call(target, ...arguments);
      };
    }
    if (target.cancel) onCancel(target.cancel);

    return create(({ cancel, cancelled }) => {
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

      return Object.assign(promise, {
        cancel,
      });
    });
  }

  function call(fn, ...args) {
    if (cancelled()) throw new CancelledError();
    const result = fn(...args);
    if (isPromiseLike(result)) return wrap(result);
    return result;
  }

  return start ? start(task) : task;
}

class CancelledError extends Error {}
