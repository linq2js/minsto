import minsto from "../index";

test("watch", () => {
  const store = minsto({ v1: 1, v2: 2, v3: 3 });
  const callback = jest.fn();
  store.watch(
    (state) => ({ v1: state.v1, v2: state.v2 }),
    (args) => callback(args.value)
  );
  store.v3++;
  expect(callback).toBeCalledTimes(0);
  store.v2++;
  expect(callback).toBeCalledTimes(1);
  expect(callback).lastCalledWith({ v1: 1, v2: 3 });
});
