import minsto from "../index";

const todoStoreModel = {
  state: {
    items: [],
  },
  actions: {
    add(store, payload) {
      store.items = store.items.concat(payload);
    },
    remove(store, payload) {
      store.mutate("items", (items) =>
        items.filter((item) => item !== payload)
      );
    },
  },
};

test("add todo", () => {
  const store = minsto(todoStoreModel);
  store.add("item 1");
  expect(store.items).toEqual(["item 1"]);
});

test("remove todo", () => {
  const store = minsto(todoStoreModel);
  store.add("item 1");
  store.add("item 2");
  store.remove("item 1");
  expect(store.items).toEqual(["item 2"]);
});
