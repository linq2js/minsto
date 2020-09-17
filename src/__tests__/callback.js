import { act, render } from "@testing-library/react";
import React, { memo } from "react";
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

test("callback using store cache", () => {
  const store = minsto({});
  const increase1 = store.callback((value) => value, 1);
  const increase2 = store.callback((value) => value, 1);
  const increase3 = store.callback((value) => value, 2);
  const increase4 = store.callback((value) => value, 2);
  const increase5 = store.callback((value) => value, 2, 3);
  const increase6 = store.callback((value) => value, 2, 3);

  expect(increase1).toBe(increase2);
  expect(increase1).not.toBe(increase3);
  expect(increase3).toBe(increase4);
  expect(increase5).toBe(increase6);
});

test("using cached callback to handle element event", async () => {
  const cartStore = minsto(cartModel);
  const renderCallback = jest.fn();
  const Product = memo(({ id }) => {
    //                👆
    const { onAdd } = useStore(cartStore, (store) => {
      return {
        onAdd: store.callback(() => store.add(id), id),
        //                                          👆
      };
    });
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

  expect(renderCallback).toBeCalledTimes(2);
});
