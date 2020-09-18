import { useEffect, useRef, useState } from "react";
import createStore from "./createStore";

export default function useLocalStore(model, options) {
  const storeRef = useRef(undefined);
  const [, renrender] = useState(undefined);
  if (!storeRef.current) {
    storeRef.current = createStore(model, options);
    storeRef.current.__rerender = renrender;
    storeRef.current.onChange(() => {
      if (storeRef.current.__isRendering) {
        storeRef.current.__shouldRerender = true;
        return;
      }
      storeRef.current.__rerender({});
    });
  }

  storeRef.current.__isRendering = true;
  useEffect(() => {
    storeRef.current.__isRendering = false;
    if (storeRef.current.__shouldRerender) {
      storeRef.current.__shouldRerender = false;
      renrender({});
    }
  });
  return storeRef.current;
}
