import isPromiseLike from "./isPromiseLike";
import { noop } from "./types";

export default function createTask(fn = noop, options = {}) {
  let lastTask;
  return function () {
    if (options.latest && lastTask) {
      lastTask.cancel();
    }

    const task = (lastTask = {
      cancelled,
      cancel,
      wrap,
      delay,
      call(fn, ...args) {
        return run(fn, args);
      }
    });
    const props = {
      timerIds: []
    };

    function delay(ms, fn = noop) {
      let timerId;
      return Object.assign(
        new Promise((resolve) => {
          timerId = setTimeout(() => {
            if (props.cancelled) return;
            resolve();
          }, ms);
          props.timerIds.push(timerId);
        }).then(fn),
        {
          cancel() {
            clearTimeout(timerId);
          }
        }
      );
    }

    function cancel() {
      if (props.cancelled) return;
      props.cancelled = true;
      props.timerIds.forEach(clearTimeout);
    }

    function cancelled() {
      return props.cancelled;
    }

    function wrap(target) {
      if (typeof target === "function") {
        return function () {
          return run(target, arguments);
        };
      }

      return Object.assign(
        new Promise((resolve, reject) => {
          target.then(
            (payload) => {
              if (props.cancelled) return;
              resolve(payload);
            },
            (error) => {
              if (props.cancelled) return;
              reject(error);
            }
          );
        }),
        {
          cancel
        }
      );
    }

    function run(fn, args) {
      if (props.cancelled) return;
      let result = fn(...args);
      if (typeof result === "function") {
        result = result(task);
      }
      if (isPromiseLike(result)) return wrap(result);
      return result;
    }

    if (!options.delay) {
      return run(fn, arguments);
    }

    return delay(options.delay, () => run(fn, arguments));
  };
}
