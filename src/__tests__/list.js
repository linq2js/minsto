import minsto from "../index";
import { List } from "../extras";

const model = {
  children: {
    numbers: List(),
  },
};

let store;

beforeEach(() => {
  store = minsto(model);
});

test("push()", () => {
  store.numbers.push(1);

  expect(store.getState()).toEqual({ numbers: { items: [1] } });
});

test("pushArray()", () => {
  store.numbers.pushArray([1, 2, 3]);

  expect(store.getState()).toEqual({ numbers: { items: [1, 2, 3] } });
});

test("pop()", () => {
  store.numbers.push(1);

  expect(store.getState()).toEqual({ numbers: { items: [1] } });

  expect(store.numbers.pop()).toBe(1);

  expect(store.getState()).toEqual({ numbers: { items: [] } });

  const original = store.numbers.items;
  expect(store.numbers.pop()).toBeUndefined();
  expect(original).toBe(store.numbers.items);
});

test("shift()", () => {
  store.numbers.pushArray([1]);

  expect(store.getState()).toEqual({ numbers: { items: [1] } });

  expect(store.numbers.shift()).toBe(1);

  expect(store.getState()).toEqual({ numbers: { items: [] } });

  const original = store.numbers.items;
  expect(store.numbers.shift()).toBeUndefined();
  expect(original).toBe(store.numbers.items);
});

test("swap()", () => {
  store.numbers.pushArray([1, 2, 3]);
  let original = store.numbers.items;
  store.numbers.swap({ from: 0, to: 2 });
  expect(store.numbers.items).toEqual([3, 2, 1]);
  expect(store.numbers.items).not.toBe(original);
});
