import { useEffect, useRef, useState } from "react";
import createStore from "./createStore";

export default function useLocalStore(model, options) {
  const data = useRef({}).current;
  const [, render] = useState(undefined);
  data.render = render;
  if (!data.store) {
    data.store = createStore(model, options);
    data.store.onChange(() => {
      if (data.isRendering) {
        data.shouldRerender = true;
        return;
      }
      data.render({});
    });
  }
  data.isRendering = true;
  useEffect(() => {
    data.isRendering = false;
    if (data.shouldRerender) {
      data.shouldRerender = false;
      data.render({});
    }
  });
  if (data.store.loading) {
    if (data.store.error) throw data.store.error;
    if (!data.storeLoadingHandled) {
      data.storeLoadingHandled = true;
      data.store.__loadingPromise.then(() => data.render({}));
    }
    throw data.store.__loadingPromise;
  }
  return data.store;
}
