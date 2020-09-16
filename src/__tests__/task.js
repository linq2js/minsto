import task from "../task";

const { delay } = task(() => (t) => t)();

test("latest", async () => {
  const callback = jest.fn();
  const t = task(
    () => async ({ delay }) => {
      await delay(10);
      callback();
    },
    { latest: true }
  );

  t();
  t();
  t();
  expect(callback).toBeCalledTimes(0);
  await delay(15);
  expect(callback).toBeCalledTimes(1);
});
