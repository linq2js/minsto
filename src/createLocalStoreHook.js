import useLocalStore from "./useLocalStore";

export default function createLocalStoreHook(model) {
  return function () {
    return useLocalStore(model);
  };
}
