import createTask from "../createTask";
import minsto from "../index";

const { delay } = createTask();

test("lock", async () => {
  const store = minsto({
    state: {
      value1: 1,
      value2: 2,
    },
  });

  store.lock(["value1", "value2"], delay(10));
  store.lock("value2", delay(20));
  expect(store.loadableOf("value1").loading).toBeTruthy();
  expect(store.loadableOf("value2").loading).toBeTruthy();
  await delay(15);
  // value1 is unlocked
  expect(store.loadableOf("value1").loading).toBeFalsy();
  // value2 still locked
  expect(store.loadableOf("value2").loading).toBeTruthy();
  expect(store.value1).toBe(1);
  await delay(10);
  // value2 is unlocked
  expect(store.loadableOf("value2").loading).toBeFalsy();
});
