export default function createListStore(items = []) {
  function mutate(store, mutation) {
    let items = store.items;
    let clonedItems;
    return mutation(
      items,
      function clone() {
        if (!clonedItems) {
          store.items = clonedItems = items.slice();
        }
        return clonedItems;
      },
      function update(value) {
        store.items = items = value;
      }
    );
  }

  return {
    state: {
      items,
    },
    actions: {
      init(store, { initial }) {
        if (typeof initial !== "undefined") {
          store.items = initial;
        }
      },
      push(store, item) {
        return mutate(store, (original, clone, update) =>
          update(original.concat([item]))
        );
      },
      pushArray(store, items) {
        return mutate(store, (original, clone, update) =>
          update(original.concat(items))
        );
      },
      pop(store) {
        return mutate(store, (original, clone) =>
          original.length ? clone().pop() : undefined
        );
      },
      shift(store) {
        return mutate(store, (original, clone) =>
          original.length ? clone().shift() : undefined
        );
      },
      unshift(store, item) {
        return mutate(store, (original, clone, update) =>
          update([item].concat(original))
        );
      },
      unshiftArray(store, items) {
        return mutate(
          store,
          (original, clone, update) =>
            Array.isArray(items) && update(items.concat(original))
        );
      },
      splice(store, { index = 0, length = 0, items = [] } = {}) {
        return mutate(store, (original, clone) => {
          if (index + length < original.length || items.length) {
            clone().splice(index, length, ...items);
          }
        });
      },
      set(store, { index = 0, value } = {}) {
        return mutate(
          store,
          (original, clone) =>
            index < original.length && clone().splice(index, 1, value)
        );
      },
      swap(store, { from = 0, to = 0 } = {}) {
        return mutate(store, (original, clone) => {
          if (from === to) return;
          if (original[from] === original[to]) return;
          clone()[to] = clone().splice(from, 1, original[to])[0];
        });
      },
      sort(store, sorter) {
        return mutate(store, (original, clone) => clone().sort(sorter));
      },
      orderBy(store, selector) {
        return store.sort((a, b) => {
          const av = selector(a);
          const bv = selector(b);
          if (av === bv) return 0;
          if (av > bv) return 1;
          return -1;
        });
      },
    },
  };
}
