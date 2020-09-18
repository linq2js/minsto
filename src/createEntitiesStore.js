import createEntities from "./createEntities";
import ValueWrapper from "./ValueWrapper";

export default function createEntitiesStore(initial, options) {
  let entities = createEntities(initial, options);

  function mutate(store, newEntities) {
    entities = newEntities;
    store.ids = entities.ids;
    store.entities = entities.entities;
    store.get = new ValueWrapper(entities.get);
  }

  return {
    state: {
      get: entities.get,
      ids: entities.ids,
      entities: entities.entities,
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
