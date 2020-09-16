import minsto from "../index";

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
      }
    }
  });
  store.onChange(callback);
  // should optimize state mutation, notify change once after dispatching
  store.update();
  expect(store.v1).toBe(2);
  expect(store.v2).toBe(3);
  expect(callback).toBeCalledTimes(1);
});
