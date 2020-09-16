import minsto from "../index";

const CounterPlugin = (plugin) => {
  return {
    count: 1,
    logs: 0,
    $computed: {
      _count: () => plugin.count,
      double: ["_count", (count) => count * 2],
    },
    increase() {
      plugin.count++;
    },
    decrease() {
      plugin.count--;
    },
    init(store) {
      store.when(plugin.increase, () => plugin.logs++);
    },
  };
};

test("basic plugin", () => {
  const store = minsto().use(CounterPlugin);
  expect(store.count).toBe(1);
  store.increase();
  expect(store.count).toBe(2);
  expect(store.double).toBe(4);
  expect(store.logs).toBe(1);
});

test("named plugin", () => {
  const store = minsto().use("counter", CounterPlugin);
  expect(store.counter.count).toBe(1);
  store.counter.increase();
  expect(store.counter.count).toBe(2);
  expect(store.counter.double).toBe(4);
});
