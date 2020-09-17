export function connectReactotronRedux(enhancer, rootStore) {
  let isTriggeringDispatch = false;
  const enhancedStore = enhancer((reducer) => {
    return {
      getState() {
        return rootStore.getState();
      },
      dispatch(action) {
        if (isTriggeringDispatch) return;
      },
      subscribe(subscription) {
        return rootStore.onDispatch(subscription);
      },
    };
  })(() => rootStore.getState(), rootStore.getState());

  function handleDispatching(store, name) {
    store.onDispatch((args) => {
      try {
        isTriggeringDispatch = true;
        enhancedStore.dispatch({
          type: name + "->" + args.type,
          payload: args.payload,
        });
      } finally {
        isTriggeringDispatch = false;
      }
    });

    Object.entries(store.getPlugins()).forEach(([pluginName, plugin]) => {
      handleDispatching(plugin, name + "." + pluginName);
    });
  }

  handleDispatching(rootStore, "root");

  return enhancedStore;
}
