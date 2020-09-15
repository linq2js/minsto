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
