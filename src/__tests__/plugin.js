import minsto from "../index";

function createHistoryPlugin(props) {
  return {
    state: {
      current: undefined,
      entries: []
    },
    init(store, parentStore) {
      parentStore.watch(props, (args) => {
        store.push(args.current);
      });
    },
    actions: {
      push(store, entry) {
        store.entries = store.entries.concat(entry);
        store.current = entry;
      }
    }
  };
}

test("history", () => {
  const store = minsto({
    state: { v1: 1, v2: 2, v3: 3 },
    plugins: {
      history: createHistoryPlugin(["v1", "v2"])
    }
  });

  expect(store.history.current).toBeUndefined();

  store.v1++;
  expect(store.history.current).toEqual({ v1: 2, v2: 2 });
  expect(store.history.entries).toEqual([{ v1: 2, v2: 2 }]);

  store.v2++;
  expect(store.history.current).toEqual({ v1: 2, v2: 3 });
  expect(store.history.entries).toEqual([
    { v1: 2, v2: 2 },
    { v1: 2, v2: 3 }
  ]);
});
