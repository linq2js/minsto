import { useRef, useState, useEffect } from "react";
import isEqual from "./isEqual";
import isPromiseLike from "./isPromiseLike";
import { selectContext } from "./storeContext";

const defaultSelector = (store) => store.getState();

export default function useStore(store, selector = defaultSelector) {
  if (typeof selector === "string") {
    const prop = selector;
    selector = (state) => state[prop];
  }
  const data = useRef({}).current;
  data.selector = selector;
  data.rerender = useState(undefined)[1];

  if (!data.handleChange || data.store !== store) {
    data.store = store;
    delete data.error;
    data.select = () => {
      try {
        selectContext(true);
        return data.selector(data.store);
      } finally {
        selectContext(undefined);
      }
    };
    data.handleChange = () => {
      data.error = undefined;
      try {
        const next = data.select();
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
  useEffect(() => data.store.onChange(data.handleChange), [data, store]);

  if (data.error) throw data.error;
  data.prev = data.select();
  return data.prev;
}
