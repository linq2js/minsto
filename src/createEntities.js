import isEqual from "./isEqual";

const defaultSelectId = (item) => item.id;
const defaultOptions = {};
const defaultInitial = [];
const emptyIds = [];
const emptyEntities = {};

export default function createEntities(
  initial = defaultInitial,
  options = defaultOptions
) {
  const { selectId = defaultSelectId, equal = isEqual } = options;
  return createEntitiesWrapper(emptyIds, emptyEntities, {
    ...options,
    selectId,
    equal,
  }).update(initial);
}

function createEntitiesWrapper(ids, entities, options) {
  const { slice: slicerMap = {} } = options;
  let sliceCache = options.__sliceCache || new WeakMap();
  const slicers = Object.entries(slicerMap).map((x) => x[1]);
  let value;

  function create(newIds, newEntities, customOptions) {
    return createEntitiesWrapper(newIds || ids, newEntities || entities, {
      ...options,
      ...customOptions,
    });
  }

  function copySliderCache(slicers) {
    const cache = new WeakMap();
    slicers.forEach((slicer) => {
      cache.set(slicer, sliceCache.get(slicer));
    });
    return cache;
  }

  function slice(name) {
    if (!slicerMap || !(name in slicerMap)) {
      throw new Error("No slicerMap named " + name);
    }
    const slicer = slicerMap[name];
    let value = sliceCache.get(slicer);
    if (!value) {
      value = {};
      sliceCache.set(slicer, value);
      ids.forEach((id) => {
        value[id] = slicer(entities[id]);
      });
    }
    return value;
  }

  return {
    ids,
    entities,
    get() {
      if (arguments.length) {
        return slice(arguments[0]);
      }
      if (!value) {
        value = ids.map((id) => entities[id]);
      }
      return value;
    },
    update(inputEntity, merge) {
      const inputEntities = Array.isArray(inputEntity)
        ? inputEntity
        : [inputEntity];
      if (!inputEntities.length) return this;

      let newIds;
      let newEntities;

      const unaffectedSlicers = new Set();

      inputEntities.forEach((inputEntity) => {
        if (typeof inputEntity !== "object") {
          throw new Error(
            "Entity must be object type but got " + typeof inputEntity
          );
        }

        const id = options.selectId(inputEntity);
        if (typeof id !== "number" && typeof id !== "string") {
          throw new Error(
            "Entity id must be string or number but got " + typeof id
          );
        }
        const currentEntity = (newEntities || entities)[id];
        if (merge) {
          inputEntity = { ...currentEntity, ...inputEntity };
        }
        const isNew = !currentEntity;
        const equal = merge
          ? isEqual(inputEntity, currentEntity)
          : currentEntity === inputEntity;
        if (!equal) {
          if (isNew) {
            // if new one to be added, all slicers are affected
          } else {
            // find out affected slicers
            slicers.forEach((slicer) => {
              const sliceCacheValue = sliceCache.get(slicer);
              if (
                sliceCacheValue &&
                id in sliceCacheValue &&
                options.equal(sliceCacheValue[id], slicer(inputEntity))
              ) {
                unaffectedSlicers.add(slicer);
              }
            });
          }
          if (!newEntities) newEntities = { ...entities };
          newEntities[id] = inputEntity;
        }
        if (isNew) {
          if (slicerMap) {
            // clear all cache
            sliceCache = new WeakMap();
          }
          if (!newIds) newIds = ids.slice();
          newIds.push(id);
        }
      });
      // nothing to change
      if (!newIds && !newEntities) return this;

      return create(newIds, newEntities, {
        __sliceCache: copySliderCache(unaffectedSlicers),
      });
    },
    remove(inputId) {
      const filter = Array.isArray(inputId)
        ? (x) => inputId.includes(x)
        : (x) => x === inputId;
      let newIds;
      let newEntities;
      let found = false;
      ids.forEach((id) => {
        if (!filter(id)) {
          if (!newIds) {
            newIds = [];
            newEntities = {};
          }
          newIds.push(id);
          newEntities[id] = entities[id];
        } else {
          found = true;
        }
      });
      // remove all
      if (found && !newIds) return create(emptyIds, emptyEntities);
      return newIds ? create(newIds, newEntities) : this;
    },

    clear() {
      return create(emptyIds, emptyEntities);
    },
  };
}
