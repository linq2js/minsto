import minsto from "./index";

test("counter", () => {
  const counter = minsto({ count: 0 });
  const callback = jest.fn();
  counter.subscribe(callback);
  counter.count++;
  expect(counter.count).toBe(1);
  expect(callback).toBeCalledTimes(1);
});

test("clone state", () => {
  const counter = minsto({ count: 0 });
  const state = { ...counter };
  expect(state).toEqual({ count: 0 });
});

test("simple computed prop", () => {
  const counter = minsto({
    count: 1,
    $computed: { double: (state) => state.count * 2 },
  });

  expect(counter.double).toBe(2);
});

test("complex computed prop", () => {
  const callback = jest.fn();
  const counter = minsto({
    a: 1,
    b: 2,
    c: 3,
    $computed: {
      selectA: (state) => state.a,
      selectB: (state) => state.b,
      result: ["selectA", "selectB", (a, b) => a + b],
      doubleResult: [
        "result",
        (result) => {
          callback();
          return result * 2;
        },
      ],
    },
  });

  expect(counter.result).toBe(3);
  expect(counter.doubleResult).toBe(6);
  const state = { ...counter };
  expect(state).toEqual({ a: 1, b: 2, c: 3 });
  expect(callback).toBeCalledTimes(1);
  // update store state but computed property does not re-calculate
  counter.c = 5;
  expect(callback).toBeCalledTimes(1);
});
