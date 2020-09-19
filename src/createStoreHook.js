import useStore from "./useStore";

export default function createStoreHook(store) {
  if (arguments.length < 2) {
    return function (selector) {
      return useStore(store, selector);
    };
  }
  const selector = arguments[1];
  return function (payload) {
    return useStore(store, () => selector(store, payload));
  };
}
