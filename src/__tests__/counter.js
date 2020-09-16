import { render, fireEvent } from "@testing-library/react";
import React from "react";
import minsto from "../index";
import useStore from "../react";

const CounterModel = {
  count: 0,
  increase(store) {
    store.count++;
  },
};

const CounterApp = ({ store }) => (
  <h1 data-testid="value" onClick={store.increase}>
    {useStore(store).count}
  </h1>
);

test("render properly", () => {
  const store = minsto(CounterModel);
  const { getByTestId } = render(<CounterApp store={store} />);
  const $value = getByTestId("value");
  expect($value.innerHTML).toBe("0");
  fireEvent.click($value);
  expect($value.innerHTML).toBe("1");
});
