import useStore from "./useStore";

import createComponentStore from "./createComponentStore";
import useLocalStore from "./useLocalStore";

export { createComponentStore, useLocalStore };

export default useStore;

Object.assign(useStore, {
  create: createComponentStore,
  local: useLocalStore,
});
