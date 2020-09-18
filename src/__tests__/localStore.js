import { render, fireEvent } from "@testing-library/react";
import React from "react";
import { useLocalStore } from "../react";

test("counter", () => {
  const model = {
    state: { count: 0 },
    actions: { increase: (store) => store.count++ },
  };
  const App = () => {
    const store = useLocalStore(model);

    return (
      <>
        <h1 data-testid="value" onClick={() => store.increase()}>
          {store.count}
        </h1>
      </>
    );
  };

  const { getByTestId } = render(<App />);

  const $value = getByTestId("value");

  expect($value.innerHTML).toBe("0");

  fireEvent.click($value);
  fireEvent.click($value);

  expect($value.innerHTML).toBe("2");
});
