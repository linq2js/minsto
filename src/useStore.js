import { useEffect, useRef, useState } from "react";
import createArrayKeyedMap from "./createArrayKeyedMap";
import isEqual from "./isEqual";
import isPromiseLike from "./isPromiseLike";
import { selectContext } from "./storeContext";
import { storeType } from "./types";

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
    data.childStores = new WeakMap();
    data.childStores.array = [];
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
      let context;
      try {
        context = selectContext({
          get cache() {
            if (!data.cache) {
              data.cache = createArrayKeyedMap();
            }
            return data.cache;
          },
          addChildStore(childStore) {
            if (data.childStores.has(childStore)) return;
            data.childStores.set(
              childStore,
              childStore.onChange(data.handleChange)
            );
            data.childStores.array.push(childStore);
          },
        });
        context.cache.index = 0;
        return data.selector(data.store);
      } finally {
        if (
          typeof data.prevCacheIndex === "number" &&
          data.prevCacheIndex !== context.cache.index
        ) {
          data.error = new Error("Number of callbacks is changed");
        }
        data.prevCacheIndex = context.cache.index;
        selectContext(undefined);
      }
    };
    data.handleChange = () => {
      data.error = undefined;
      try {
        const next = data.select();
        const isStore = next && next.__type === storeType;
        if (!isStore && isEqual(next, data.prev)) {
          return;
        }
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
  useEffect(() => {
    const unsubscribe = data.store.onChange(data.handleChange);
    return function () {
      unsubscribe();
      data.childStores.array.forEach((childStore) =>
        data.childStores.get(childStore)()
      );
    };
  }, [data, store]);

  if (data.error) throw data.error;
  data.prev = data.select();
  return data.prev;
}
