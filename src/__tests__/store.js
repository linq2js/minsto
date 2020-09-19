import { act, render } from "@testing-library/react";
import React, { Suspense } from "react";
import createTask from "../createTask";
import minsto from "../index";
import useStore from "../react";

const { delay } = createTask();

test("mutate store.stateProp", () => {
  const store = minsto({ state: { count: 0 } });

  store.count++;

  expect(store.count).toBe(1);
});

test("call store.action", () => {
  const callback = jest.fn();
  const store = minsto({
    state: { v1: 1, v2: 2 },
    actions: {
      update(store) {
        store.v1++;
        store.v2++;
      },
    },
  });
  store.onChange(callback);
  // should optimize state mutation, notify change once after dispatching
  store.update();
  expect(store.v1).toBe(2);
  expect(store.v2).toBe(3);
  expect(callback).toBeCalledTimes(1);
});

test("lazy init (success)", async () => {
  const store = minsto({
    init(store) {
      return delay(10);
    },
  });

  expect(store.loading).toBeTruthy();
  await delay(15);
  expect(store.loading).toBeFalsy();
});

test("lazy init (failure)", async () => {
  const store = minsto({
    init(store) {
      return delay(10).then(() => Promise.reject("invalid"));
    },
  });
  expect(store.loading).toBeTruthy();
  await delay(15);
  expect(store.loading).toBeTruthy();
  expect(store.error).toBe("invalid");
});

test("should suspense UI if store is not ready to use", async () => {
  const store = minsto({
    state: {
      count: 0,
    },
    async init() {
      await delay(10);
    },
  });
  const App = () => {
    useStore(store, (store) => store.count);
    return "";
  };
  const { findByTestId } = render(
    <Suspense fallback={<div data-testid="loading" />}>
      <App />
    </Suspense>
  );

  await expect(findByTestId("loading")).resolves.not.toBeUndefined();
  await act(() => delay(15));
  await expect(findByTestId("loading")).rejects.toThrowError();
});

test("should suspense UI if any store state is not ready to use", async () => {
  const store = minsto({
    state: {
      count: delay(10, 5),
    },
  });
  const App = () => {
    useStore(store, (store) => store.count);
    return "";
  };
  const { findByTestId } = render(
    <Suspense fallback={<div data-testid="loading" />}>
      <App />
    </Suspense>
  );
  expect(store.count).toBeUndefined();
  await expect(findByTestId("loading")).resolves.not.toBeUndefined();
  await act(() => delay(15));
  await expect(findByTestId("loading")).rejects.toThrowError();
  expect(store.count).toBe(5);
});

test("should prevent mergeState call outside action", () => {
  const store = minsto({
    state: {
      count: 0,
    },
  });

  expect(() => store.mergeState({ count: 1 })).toThrowError();
  expect(store.count).toBe(0);
  store.dispatch(function merge() {
    store.mergeState({ count: 1 });
  });
  expect(store.count).toBe(1);
});
