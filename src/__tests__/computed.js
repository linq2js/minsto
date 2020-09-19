import minsto from "../index";

const model = {
  state: {
    a: 1,
    b: 2,
    deep: {
      object: {
        value: 100,
      },
    },
  },
  computed: {
    sum: ["$a", "$b", (a, b) => a + b],
    doubleSum: ["sum", (sum) => sum * 2],
    deepObjectValue: "$deep.object.value",
    deepObjectValue2: "$deep.object.value",
  },
};

test("computed", () => {
  const store = minsto(model);
  expect(store.sum).toBe(3);
  expect(store.doubleSum).toBe(6);
  store.a++;
  expect(store.sum).toBe(4);
  expect(store.doubleSum).toBe(8);
  expect(store.deepObjectValue).toBe(100);
  expect(store.deepObjectValue2).toBe(100);
});
