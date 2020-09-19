import { createEntities, createEntitiesFrom } from "./createEntities";

export default function createEntitiesStore(initial, options) {
  let entities = createEntities(initial, options);

  function mutate(store, newEntities) {
    entities = newEntities;
    store.ids = entities.ids;
    store.entities = entities.entities;
  }

  return {
    merge(store, state = {}) {
      if (state.ids && state.entities) {
        mutate(
          store,
          createEntitiesFrom(
            state.ids || [],
            state.entities || {},
            entities.options()
          )
        );
      }
    },
    state: {
      ids: entities.ids,
      entities: entities.entities,
    },
    inject(store, state) {
      Object.defineProperty(state, "get", {
        value: entities.get,
        enumerable: false,
      });
    },
    actions: {
      update(store, inputEntities) {
        mutate(store, entities.update(inputEntities));
      },
      merge(store, inputEntities) {
        mutate(store, entities.update(inputEntities, true));
      },
      remove(store, inputId) {
        mutate(store, entities.remove(inputId));
      },
    },
  };
}
