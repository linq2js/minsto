import { act, render } from "@testing-library/react";
import React, { memo, useRef } from "react";
import createTask from "../createTask";
import minsto from "../index";
import useStore from "../react";

const cartModel = {
  state: {
    id: 1,
    version: 0,
    products: {},
  },
  actions: {
    add(store, productId) {
      store.products = { ...store.products, [productId]: true };
    },
  },
};

const { delay } = createTask();

test("using cached callback to handle element event", async () => {
  const cartStore = minsto(cartModel);
  const callbackChanged = jest.fn();
  const renderCallback = jest.fn();
  const Product = memo(({ id }) => {
    //                👆
    const currentCallbackRef = useRef(undefined);
    const { onAdd } = useStore(cartStore, (store) => {
      return {
        onAdd: store.callback(() => store.add(id), id),
        //                                          👆
      };
    });
    if (currentCallbackRef.current && currentCallbackRef.current !== onAdd) {
      callbackChanged();
    }
    currentCallbackRef.current = onAdd;
    renderCallback();
    return (
      <button onClick={onAdd} data-testid="add">
        Add
      </button>
    );
  });

  const App = () => {
    const id = useStore(cartStore, (store) => store.id);

    return <Product id={id} />;
  };

  const { getByTestId } = render(<App />);

  expect(renderCallback).toBeCalledTimes(1);

  // change version will make store update
  // but onAdd handler should not be updated

  act(() => {
    cartStore.version++;
  });

  expect(renderCallback).toBeCalledTimes(1);

  // change product id will affect to onAdd handler

  act(() => {
    cartStore.id = 2;
  });
  expect(callbackChanged).toBeCalledTimes(1);
  expect(renderCallback).toBeCalledTimes(2);
});
