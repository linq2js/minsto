# Minsto

A mini store for javascript/React app

## Get Started

### Installation

```text
npm install minsto --save
```

### Step 1 - Create your store

```jsx harmony
import minsto from "minsto";

const todoStore = minsto({
  state: {
    items: ["Create store", "Use the store"],
  },
  actions: {
    add(store, payload /* item title */) {
      // state.items is immutable
      // we must use array.concat to create new copy of items and append new item at end
      store.items = store.items.concat(payload);
    },
  },
});
```

### Step 2 - Use the store

```jsx harmony
import React, { useRef } from "react";
import todoStore from "./todoStore";
import useStore from "minsto/react";

function TodoList() {
  const inputRef = useRef();
  const { todos, add } = useStore(todoStore, (store) => {
    return {
      todos: store.items,
      add: store.add,
    };
  });
  return (
    <div>
      <input ref={inputRef} />
      <button onClick={() => add(inputRef.current.value)}>Add</button>
      <ul>
        {todos.map((todo, index) => (
          <li key={index}>{todo}</li>
        ))}
      </ul>
    </div>
  );
}
```

The useStore hook has the following signature.

```jsx harmony
const result = useStore(CounterStore, (store) => {
  return {
    count: store.count,
    increase: store.increase,
  };
});
console.log(result.count, result.increase);
```

The hook accepts a storeMapper function.
The storeMapper function will be provided your input store and should return the slice of state or actions required by your component.
Anytime an update occurs on your store the storeMapper function will be executed, and if the newly mapped result does not equal the previously mapped result your component will be rendered with the new value.

## Using actions to update state

In this section we will tell you how to update store state

### Defining actions on our model

We are going to define two actions on our counterStoreModel;
one to increase count state, and another to decrease count state.
Action is pure function that retrieves two arguments (store object and action payload)

```jsx harmony
const counterStoreModel = {
  state: {
    count: 0,
  },
  // all action definitions must be placed inside actions block
  actions: {
    increase(store, payload) {
      store.count++;
    },
    decrease(store, payload) {
      store.count--;
    },
  },
};
```

Because action is pure function, you can write unit test easily

```jsx harmony
test("increase", () => {
  const state = { count: 0 };
  counterStoreModel.actions.increase(state);
  expec(state.count).toBe(1);
});
```

## Using custom hook

[Counter App with custom store hook](https://codesandbox.io/s/minsto-custom-hook-lqk94?file=/src/App.js)

## Features

1. Zero configuration
1. No boilerplate
1. Plugins supported
1. React Suspense supported
1. Future action listening supported
1. Cancellable action dispatching supported
1. React hooks based API
1. Computed properties - i.e. derived data
1. Data fetching / side effects
1. Extensive TypeScript support
1. Global, shared, or component level stores
1. Local store supported
1. React Native supported
1. Hot Reloading supported
1. Reactotron supported

## Local Store (TBD)

If you don't want to mess many things into the global state,
you can use local store to split app logics that used to only specified component.
The local store instance stored in host component. It will be removed when its host component is unmounted.
A host component can contain many local store, local store model can be reused by many components.

```jsx harmony
import { useLocalStore } from "minsto/react";
const CounterModel = {
  state: {
    count: 0,
    step: 1,
  },
  actions: {
    increase() {
      store.count += store.step;
    },
  },
};
const Counter = ({ step = 1 }) => {
  const store = useLocalStore(CounterModel);
  // pass step prop to store
  store.step = step;

  return <h1 onClick={store.increase}>{store.count}</h1>;
};
```

## Working with Development Tools

### Reactotron

#### Install reactotron-redux

```text
npm install --save-dev reactotron-redux
```

#### Configuring

```jsx harmony
import Reactotron from "reactotron";
import { reactotronRedux } from "reactotron-redux";
import minsto from "minsto";
import { connectReactotronRedux } from "minsto/reactotron";
const reactotron = Reactotron.configure({ name: "React Native Demo" })
  .use(reactotronRedux())
  .connect();

const storeEnhander = reactotron.createEnhancer();
const counterStore = minsto({
  state: { count: 0 },
  actions: {
    increase: (store) => store.count++,
  },
});

connectReactotronRedux(storeEnhander, counterStore);
```

## Performance

1. [Minsto](https://codesandbox.io/s/minsto-performance-v1-cexjx)
1. [Redux](https://codesandbox.io/s/will123195redux-performance-56980)
1. [Stoze](https://codesandbox.io/s/stoze-performance-3q6ib?file=/src/index.js)
1. [Easy Peasy](https://codesandbox.io/s/easy-peasy-performance-chr7b?file=/src/App.js)

## Examples

1. [Counter App](https://codesandbox.io/s/minsto-counter-kxem7?file=/src/App.js)
