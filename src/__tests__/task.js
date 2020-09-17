import createTask from "../createTask";

const { delay } = createTask();

test("latest", async () => {
  const callback = jest.fn();
  let last;
  async function doSomething() {
    const task = (last = createTask({ last }));
    task.latest();
    await task.delay(10);
    callback();
  }

  doSomething();
  doSomething();
  doSomething();

  expect(callback).toBeCalledTimes(0);
  await delay(15);
  expect(callback).toBeCalledTimes(1);
});

test("call", async () => {
  const callback = jest.fn();
  const api = () => delay(10);
  function doSomething() {
    const task = createTask();
    task.call(async () => {
      await task.call(api);
      callback();
    });
    return task;
  }

  doSomething();
  await delay(15);
  expect(callback).toBeCalledTimes(1);

  const t1 = doSomething();
  t1.cancel();
  await delay(15);
  expect(callback).toBeCalledTimes(1);
});
