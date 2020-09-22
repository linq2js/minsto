import useStore from "./useStore";

import createStoreHook from "./createStoreHook";
import createLocalStoreHook from "./createLocalStoreHook";
import useLocalStore from "./useLocalStore";
import useValue from "./useValue";

export { createStoreHook, createLocalStoreHook, useLocalStore, useValue };

export default useStore;

Object.assign(useStore, {
  create: createStoreHook,
  local: createLocalStoreHook,
});
