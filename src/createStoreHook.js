import createStore from "./createStore";
import { storeType } from "./types";
import useStore from "./useStore";

export default function createStoreHook(storeOrModel) {
  if (storeOrModel.__type !== storeType) {
    storeOrModel = createStore(storeOrModel);
  }
  if (arguments.length < 2) {
    return function (selector) {
      return useStore(storeOrModel, selector);
    };
  }
  const selector = arguments[1];
  return function (payload) {
    return useStore(storeOrModel, () => selector(storeOrModel, payload));
  };
}
