import { createEntities, createEntitiesFrom } from "./createEntities";

export default function createEntitiesStore(initial, options) {
  let initialEntities = createEntities(initial, options);

  function getEntities(store) {
    if (!store.__entities) {
      store.__entities = initialEntities;
    }
    return store.__entities;
  }

  function mutate(store, mutator) {
    store.__entities = mutator(getEntities(store));
    store.ids = store.__entities.ids;
    store.entities = store.__entities.entities;
  }

  return {
    merge(store, state = {}) {
      if (state.ids && state.entities) {
        store.dispatch(mutate, () =>
          createEntitiesFrom(
            state.ids || [],
            state.entities || {},
            initialEntities.options()
          )
        );
      }
    },
    state: {
      ids: initialEntities.ids,
      entities: initialEntities.entities,
    },
    inject(store, state) {
      Object.defineProperty(state, "get", {
        value: getEntities(store).get,
        enumerable: false,
      });
    },
    actions: {
      update(store, inputEntities) {
        mutate(store, (entities) => entities.update(inputEntities));
      },
      merge(store, inputEntities) {
        mutate(store, (entities) => entities.update(inputEntities, true));
      },
      remove(store, inputId) {
        mutate(store, (entities) => entities.remove(inputId));
      },
    },
  };
}
