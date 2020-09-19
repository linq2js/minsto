import minsto from "../index";

const model = {
  state: {
    a: 1,
    b: 2,
  },
  computed: {
    sum: ["$a", "$b", (a, b) => a + b],
    doubleSum: ["sum", (sum) => sum * 2],
  },
};

test("computed", () => {
  const store = minsto(model);
  expect(store.sum).toBe(3);
  expect(store.doubleSum).toBe(6);
  store.a++;
  expect(store.sum).toBe(4);
  expect(store.doubleSum).toBe(8);
});
