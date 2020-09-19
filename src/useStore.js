import { useEffect, useRef, useState } from "react";
import createArrayKeyedMap from "./createArrayKeyedMap";
import isEqual from "./isEqual";
import isPromiseLike from "./isPromiseLike";
import { selectContext } from "./storeContext";

export default function useStore(store, selector) {
  if (!selector) throw new Error("selector required");
  if (typeof selector === "string") {
    const prop = selector;
    selector = (state) => state[prop];
  }
  const data = useRef({}).current;
  data.selector = selector;
  data.rerender = useState(undefined)[1];

  if (!data.handleChange || data.store !== store) {
    data.store = store;
    data.storeLoadingHandled = false;
    delete data.cache;
    delete data.error;
    data.select = () => {
      if (data.store.loading) {
        if (data.store.error) {
          throw data.store.error;
        }
        if (!data.storeLoadingHandled) {
          data.storeLoadingHandled = true;
          data.store.__loadingPromise.then(data.handleChange);
        }
        throw data.store.__loadingPromise;
      }
      try {
        selectContext({
          get cache() {
            if (!data.cache) {
              data.cache = createArrayKeyedMap();
            }
            return data.cache;
          },
        });
        return data.selector(data.store);
      } finally {
        selectContext(undefined);
      }
    };
    data.handleChange = () => {
      data.error = undefined;
      try {
        const next = data.select();
        if (next !== data.store && isEqual(next, data.prev)) return;
      } catch (e) {
        if (isPromiseLike(e)) {
          if (e === data.store.__loadingPromise) {
            // we already handle store loading promise
          } else {
            e.finally(data.handleChange);
          }
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
