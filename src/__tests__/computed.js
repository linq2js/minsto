import { act, render } from "@testing-library/react";
import React, { Suspense } from "react";
import createTask from "../createTask";
import { Entities } from "../extras";
import minsto from "../index";
import useStore from "../react";

const { delay } = createTask();

const model = {
  state: {
    a: 1,
    b: 2,
    c: 3,
    deep: {
      object: {
        value: 100,
      },
    },
  },
  computed: {
    sum: ["@a", "@b", (a, b) => a + b],
    doubleSum: ["sum", (sum) => sum * 2],
    deepObjectValue: "@deep.object.value",
    deepObjectValue2: "@deep.object.value",
    bc: { bv: "@b", cv: "@c" },
    todoTitles: "@todos.get.titles",
  },
  children: {
    todos: Entities(
      [
        { id: 1, title: "item 1" },
        { id: 2, title: "item 2" },
      ],
      {
        slice: {
          titles: (todo) => todo.title,
        },
      }
    ),
  },
};

test("computed", () => {
  const store = minsto(model);
  expect(store.sum).toBe(3);
  expect(store.doubleSum).toBe(6);
  const prevBc = store.bc;
  expect(prevBc).toEqual({ bv: 2, cv: 3 });
  store.a++;
  expect(store.sum).toBe(4);
  expect(store.doubleSum).toBe(8);
  expect(store.deepObjectValue).toBe(100);
  expect(store.deepObjectValue2).toBe(100);
  const nextBc = store.bc;
  expect(nextBc).toBe(prevBc);
  expect(store.todoTitles).toEqual({ 1: "item 1", 2: "item 2" });
});

test("async computed", async () => {
  const store = minsto({
    state: {
      a: 1,
      b: 2,
    },
    computed: {
      sum: ["@a", "@b", (a, b) => delay(10, a + b)],
    },
  });

  const App = () => {
    const sum = useStore(store, (store) => store.sum);
    return <h1 data-testid="value">{sum}</h1>;
  };

  const { findByTestId } = render(
    <Suspense fallback={<div data-testid="loading"></div>}>
      <App />
    </Suspense>
  );

  await expect(findByTestId("loading")).resolves.not.toBeUndefined();
  await delay(15);
  await expect(findByTestId("loading")).rejects.toThrowError();
  await expect(
    findByTestId("value").then((result) => result.innerHTML)
  ).resolves.toBe("3");

  await Promise.race([
    act(() => {
      store.a++;
      return delay(10);
    }),
    expect(findByTestId("loading")).resolves.not.toBeUndefined(),
  ]);

  await delay(15);
  await expect(findByTestId("loading")).rejects.toThrowError();
  await expect(
    findByTestId("value").then((result) => result.innerHTML)
  ).resolves.toBe("4");
});
