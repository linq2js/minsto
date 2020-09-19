export function connectReactotronRedux(enhancer, ...stores) {
  stores.forEach((rootStore, index) => {
    let isTriggeringDispatch = false;
    const enhancedStore = enhancer(() => {
      return {
        getState() {
          return rootStore.getState();
        },
        dispatch(action) {
          if (isTriggeringDispatch) return;
          const [storePath, actionType] = action.type.split("@");
          const store = storePath
            .split("->")
            .slice(1)
            .reduce((parentStore, prop) => parentStore[prop], rootStore);
          return store.dispatch({ type: actionType, payload: action.payload });
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
            type: name + "@" + args.type,
            payload: args.payload,
          });
        } finally {
          isTriggeringDispatch = false;
        }
      });

      Object.entries(store.getPlugins()).forEach(([pluginName, plugin]) => {
        handleDispatching(plugin, name + "->" + pluginName);
      });
    }

    handleDispatching(
      rootStore,
      rootStore.name || (stores.length === 1 ? "root" : "store" + index)
    );
  });
}
