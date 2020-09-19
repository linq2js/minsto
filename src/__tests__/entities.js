import { Entities } from "../extras";
import minsto from "../index";

const todoModel = {
  children: {
    todos: Entities(
      [
        { id: 1, title: "item 1" },
        { id: 2, title: "item 2" },
      ],
      { slice: { title: (todo) => todo.title } }
    ),
  },
};

test("entities", () => {
  const store = minsto(todoModel);
  expect(store.todos.ids).toEqual([1, 2]);
  expect(store.todos.entities).toEqual({
    1: { id: 1, title: "item 1" },
    2: { id: 2, title: "item 2" },
  });

  expect(store.getState().todos.get("title")).toEqual({
    1: "item 1",
    2: "item 2",
  });
});

test("entities merge", () => {
  const store = minsto(todoModel);
  store.todos.update({ id: 1, title: "new title" });
  expect(store.todos.entities).toEqual({
    1: { id: 1, title: "new title" },
    2: { id: 2, title: "item 2" },
  });
});

test("restore state", () => {
  const persistState = {
    todos: {
      ids: [3, 4],
      entities: {
        3: { id: 3, title: "item 3" },
        4: { id: 4, title: "item 4" },
      },
    },
  };
  const store = minsto({
    ...todoModel,
    init(store) {
      store.mergeState(persistState);
    },
  });

  expect(store.getState()).toEqual(persistState);
  expect(store.todos.ids).toEqual(persistState.todos.ids);
  expect(store.todos.entities).toEqual(persistState.todos.entities);
});

test("isolated child store takes no effect when parent store changed state", () => {
  const persistState = {
    $todos: {
      ids: [3, 4],
      entities: {
        3: { id: 3, title: "item 3" },
        4: { id: 4, title: "item 4" },
      },
    },
  };
  const store = minsto({
    ...todoModel,
    init(store) {
      store.mergeState(persistState);
    },
    children: {
      $todos: todoModel.children.todos,
    },
  });

  expect(store.getState()).toEqual({});
  expect(store.$todos.ids).toEqual([1, 2]);
  expect(store.$todos.entities).toEqual({
    1: { id: 1, title: "item 1" },
    2: { id: 2, title: "item 2" },
  });
});
