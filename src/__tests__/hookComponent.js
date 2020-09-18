import { act, renderHook } from "@testing-library/react-hooks";
import minsto from "../index";
import useStore from "../react";

const counterModel = {
  state: { count: 0 },
  actions: { increase: (store) => store.count++ },
};

test("component level hook", () => {
  const counterStore = minsto(counterModel);
  const useCounterStore = useStore.create(counterStore);
  const { result } = renderHook(() => useCounterStore((store) => store.count));
  expect(result.current).toBe(0);
  act(() => {
    counterStore.increase();
  });
  expect(result.current).toBe(1);
});
