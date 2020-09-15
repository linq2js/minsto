import { useRef, useState, useLayoutEffect } from "react";
import isEqual from "./isEqual";
import isPromiseLike from "./isPromiseLike";

const defaultSelector = (state) => state;

export default function useStore(store, selector = defaultSelector) {
  const data = useRef({}).current;
  data.selector = selector;
  data.rerender = useState(undefined)[1];

  if (!data.handleChange || data.store !== store) {
    data.store = store;
    delete data.error;
    data.handleChange = () => {
      data.error = undefined;
      try {
        const next = data.selector(data.store["@@state"].get());

        if (isEqual(next, data.prev)) return;
      } catch (e) {
        if (isPromiseLike(e)) {
          e.finally(data.handleChange);
        }
        data.error = e;
      }

      data.rerender({});
    };
  }
  useLayoutEffect(() => {
    const unsubscribe = data.store.subscribe(data.handleChange);
    return () => {
      unsubscribe();
    };
  }, [data, store]);

  if (data.error) throw data.error;

  data.prev = data.selector(data.store["@@state"].get());
  return data.prev;
}
