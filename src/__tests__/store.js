import createTask from "../createTask";
import minsto from "../index";

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
