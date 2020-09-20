import { History, Entities } from "../extras";
import minsto from "../index";

const model = {
  children: {
    todos: Entities(),
    history: History("todos"),
  },
};

let store;

beforeEach(() => {
  store = minsto(model);
});

test("push", () => {
  store.todos.update({ id: 1 });
  expect(store.history.entries).toEqual([
    { ids: [1], entities: { 1: { id: 1 } } },
  ]);
  store.todos.update({ id: 2 });
  expect(store.history.entries).toEqual([
    { ids: [1], entities: { 1: { id: 1 } } },
    { ids: [1, 2], entities: { 1: { id: 1 }, 2: { id: 2 } } },
  ]);
});

test("back", () => {
  store.todos.update({ id: 1 });
  store.todos.update({ id: 2 });
  expect(store.history.entries).toEqual([
    { ids: [], entities: {} },
    { ids: [1], entities: { 1: { id: 1 } } },
    { ids: [1, 2], entities: { 1: { id: 1 }, 2: { id: 2 } } },
  ]);
  expect(store.history.current).toEqual({
    ids: [1, 2],
    entities: { 1: { id: 1 }, 2: { id: 2 } },
  });

  store.history.back();
  expect(store.history.index).toBe(1);
  expect(store.history.current).toEqual({
    ids: [1],
    entities: { 1: { id: 1 } },
  });
  expect(store.history.entries).toEqual([
    { ids: [], entities: {} },
    { ids: [1], entities: { 1: { id: 1 } } },
    { ids: [1, 2], entities: { 1: { id: 1 }, 2: { id: 2 } } },
  ]);

  store.history.forward();
  expect(store.history.current).toEqual({
    ids: [1, 2],
    entities: { 1: { id: 1 }, 2: { id: 2 } },
  });
  expect(store.history.entries).toEqual([
    { ids: [], entities: {} },
    { ids: [1], entities: { 1: { id: 1 } } },
    { ids: [1, 2], entities: { 1: { id: 1 }, 2: { id: 2 } } },
  ]);

  store.history.back();
  store.todos.update({ id: 3 });
  expect(store.history.entries).toEqual([
    { ids: [], entities: {} },
    { ids: [1], entities: { 1: { id: 1 } } },
    { ids: [1, 3], entities: { 1: { id: 1 }, 3: { id: 3 } } },
  ]);
});
