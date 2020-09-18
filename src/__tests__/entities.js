import { Entities } from "../extras";
import minsto from "../index";

const todoModel = {
  children: {
    todos: Entities([
      { id: 1, title: "item 1" },
      { id: 2, title: "item 2" },
    ]),
  },
};

test("entities", () => {
  const store = minsto(todoModel);
  expect(store.todos.ids).toEqual([1, 2]);
  expect(store.todos.entities).toEqual({
    1: { id: 1, title: "item 1" },
    2: { id: 2, title: "item 2" },
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
