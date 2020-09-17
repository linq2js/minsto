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

test("all", async () => {
  const callback = jest.fn();
  createTask()
    .all([delay(10, 1), delay(5, 2)])
    .then(callback);
  expect(callback).toBeCalledTimes(0);
  await delay(15);
  expect(callback).toBeCalledTimes(1);
  expect(callback).toHaveBeenLastCalledWith([1, 2]);

  createTask().all([delay(10, 3), delay(5, 4)], (result) => callback(result));
  await delay(15);
  expect(callback).toBeCalledTimes(2);
  expect(callback).toHaveBeenLastCalledWith([3, 4]);

  const p1 = createTask().all([delay(10, 1), delay(5, 2)]);
  p1.then(callback);
  p1.cancel();
  expect(callback).toBeCalledTimes(2);
  await delay(15);
  expect(callback).toBeCalledTimes(2);

  const p2 = createTask().all([delay(10, 1), delay(5, 2)], callback);
  p2.cancel();
  expect(callback).toBeCalledTimes(2);
  await delay(15);
  expect(callback).toBeCalledTimes(2);
});

test("race", async () => {
  const callback = jest.fn();
  createTask()
    .race({ prop1: delay(10, 1), prop2: delay(5, 2) })
    .then(callback);
  expect(callback).toBeCalledTimes(0);
  await delay(15);
  expect(callback).toBeCalledTimes(1);
  expect(callback).toHaveBeenLastCalledWith({ prop2: 2 });

  createTask().race({ prop3: delay(10, 3), prop4: delay(5, 4) }, (result) =>
    callback(result)
  );
  await delay(15);
  expect(callback).toBeCalledTimes(2);
  expect(callback).toHaveBeenLastCalledWith({ prop4: 4 });

  const p1 = createTask().race({ prop1: delay(10, 1), prop2: delay(5, 2) });
  p1.then(callback);
  p1.cancel();
  expect(callback).toBeCalledTimes(2);
  await delay(15);
  expect(callback).toBeCalledTimes(2);

  const p2 = createTask().race(
    { prop1: delay(10, 1), prop2: delay(5, 2) },
    callback
  );
  p2.cancel();
  expect(callback).toBeCalledTimes(2);
  await delay(15);
  expect(callback).toBeCalledTimes(2);
});
