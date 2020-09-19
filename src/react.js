import useStore from "./useStore";

import createStoreHook from "./createStoreHook";
import useLocalStore from "./useLocalStore";

export { createStoreHook, useLocalStore };

export default useStore;

Object.assign(useStore, {
  create: createStoreHook,
  local: useLocalStore,
});
