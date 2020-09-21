export default function createHistoryStore(
  props,
  { entries = [], index = -1, initial = true, isolate = true } = {}
) {
  let isSingle = false;
  if (!Array.isArray(props)) {
    isSingle = true;
    props = [props];
  }
  return {
    isolate,
    state: {
      entries,
      index,
    },
    computed: {
      current: (state) => state.entries[state.index],
      next: (state) => state.entries[state.index + 1],
      prev: (state) => state.entries[state.index - 1],
      prevEntries: (state) =>
        state.entries.length ? state.entries.slice(0, state.index) : [],
      nextEntries: (state) =>
        state.entries.length ? state.entries.slice(state.index + 1) : [],
      length: (state) => state.entries.length,
    },
    actions: {
      clear(store, keepCurrent) {
        if (!store.entries.length) return;
        if (keepCurrent) {
          store.entries = [store.current];
          store.index = 0;
        } else {
          store.entries = [];
          store.index = -1;
        }
      },
      push(store, entry) {
        store.entries = store.entries.slice(0, store.index + 1).concat(entry);
        store.index++;
      },
      go(store, number) {
        // normalize index
        const prevIndex = store.index;
        const length = store.entries.length;
        let index = store.index + number;
        if (index < -1) {
          index = length ? 0 : -1;
        } else if (index > length - 1) {
          index = length - 1;
        }
        if (prevIndex === index) return;
        store.index = index;
        store.__revert && store.__revert();
      },
      back(store) {
        return store.go(-1);
      },
      forward(store) {
        return store.go(1);
      },
    },
    init(store, { parent }) {
      let reverting = false;
      parent.watch(
        props,
        ({ current }) => {
          if (reverting) {
            reverting = false;
            return;
          }
          store.push(isSingle ? current[props[0]] : current);
        },
        { initial }
      );

      store.__revert = () => {
        parent.dispatch(() => {
          reverting = true;
          if (isSingle) {
            parent[props[0]] = store.current;
          } else {
            Object.assign(parent, store.current);
          }
        });
      };
    },
  };
}
