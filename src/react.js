import { useRef, useState, useEffect } from "react";
import isEqual from "./isEqual";

export default function useStore(store, selector) {
  if (typeof selector === "string") {
    const prop = selector;
    selector = (state) => state[prop];
  }
  const data = useRef({}).current;
  data.selector = selector;
  data.rerender = useState(undefined)[1];
  data.stateValues = {};
  data.stateProps = new Set();

  if (!data.handleChange || data.store !== store) {
    data.store = store;
    delete data.error;
    data.getStateAccessor = () => {
      if (!data.stateAccessor) {
        data.stateAccessor = {};
        Object.keys(store.getState()).forEach((key) => {
          Object.defineProperty(data.stateAccessor, key, {
            get() {
              data.stateProps.add(key);
              const value = store[key];
              data.stateValues[key] = value;
              return value;
            },
          });
        });
      }
      return data.stateAccessor;
    };
    data.handleChange = () => {
      data.error = undefined;
      try {
        if (data.selector) {
          const next = data.selector(data.store.getState());
          if (isEqual(next, data.prev)) return;
        } else {
          const next = {};
          data.stateProps.forEach((key) => {
            next[key] = data.store[key];
          });
          if (isEqual(next, data.stateValues)) return;
        }
      } catch (e) {
        data.error = e;
      }
      data.rerender({});
    };
  }
  useEffect(() => {
    const unsubscribe = data.store.subscribe(data.handleChange);
    return () => {
      unsubscribe();
    };
  }, [data, store]);

  if (data.error) throw data.error;
  if (!selector) return data.getStateAccessor();
  data.prev = data.selector(data.store.getState());
  return data.prev;
}
