import { useRef, useState } from "react";
import Loadable from "./Loadable";

export default function useValue(value) {
  const [, rerender] = useState()[1];
  const loadableRef = useRef();
  if (value instanceof Loadable) {
    if (loadableRef.current !== value) {
      loadableRef.current = value;
      if (value.loading) {
        value.promise.finally(() => rerender({}));
      }
    }
    if (value.hasError) throw value.error;
    if (value.loading) throw value.promise;
    return value.value;
  } else {
    return value;
  }
}
