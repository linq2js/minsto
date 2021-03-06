# Minsto

A mini store for javascript/React app

## Features

1. Zero configuration
1. No boilerplate
1. Extensive TypeScript support
1. Global, shared, or component level stores
1. Plugins supported
1. React Suspense supported
1. Future action listening supported
1. Cancellable action dispatching supported
1. React hooks based API
1. Computed properties (support async mode) - i.e. derived data
1. Data fetching / side effects
1. Local store supported
1. React Native supported
1. Hot Reloading supported
1. Reactotron supported

## Get Started

### Installation

```text
npm install minsto --save
```

### Step 1 - Create your store

```jsx
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

```jsx
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

```jsx
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

```jsx
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

```jsx
test("increase", () => {
  const state = { count: 0 };
  counterStoreModel.actions.increase(state);
  expec(state.count).toBe(1);
});
```

## Using component store

[Counter App with custom store hook](https://codesandbox.io/s/minsto-custom-hook-lqk94?file=/src/App.js)

## Computed Properties

Computed properties are the perfect candidate to help us clean up the more advanced state mapping that is happening within some of our application's components. Let's refactor each derived data case.

First up, let's add a computed property to represent the total todo items.

```jsx
const todoModel = {
  state: {
    todos: [
      { id: 1, title: "todo 1", completed: false },
      { id: 2, title: "todo 2", completed: true },
    ],
  },
  computed: {
    total: (state) => state.todos.length,
  },
};
```

Next up, we will add a computed property to represent the completed todos and active todos.

```jsx
const todoModel = {
  state: {
    todos: [
      { id: 1, title: "todo 1", completed: false },
      { id: 2, title: "todo 2", completed: true },
    ],
  },
  computed: {
    total: (state) => state.todos.length,
    completed: (state) => state.todos.filter((todo) => todo.completed).length,
    active: (state) => state.todos.filter((todo) => !todo.completed).length,
  },
};
```

Computed properties optionally allow you to provide an array of state resolver functions as the first argument to the computed property definition.
These state resolver functions will receive the state that is local to the computed property, as well as the entire store state, and allow you to resolve specific slices of state that your computed function will take as an input.

```jsx
const todoModel = {
  state: {
    todos: [
      { id: 1, title: "todo 1", completed: false },
      { id: 2, title: "todo 2", completed: true },
    ],
  },
  computed: {
    total: (state) => state.todos.length,
    completed: (state) => state.todos.filter((todo) => todo.completed).length,
    active: (state) => state.todos.filter((todo) => !todo.completed).length,
    // show todo list stats
    stats: [
      // named computed properties / state resolvers
      "total",
      "completed",
      "active",
      (total, completed, active) => ({ total, completed, active }),
    ],
  },
};
```

## Local Store

If you don't want to mess many things into the global state,
you can use local store to split app logics that used to only specified component.
The local store instance stored in host component. It will be removed when its host component is unmounted.
A host component can contain many local store, local store model can be reused by many components.

```jsx
import { useLocalStore } from "minsto/react";
const CounterModel = {
  state: {
    count: 0,
    step: 1,
  },
  actions: {
    increase(store) {
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

```jsx
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

## Examples

1. [Counter App](https://codesandbox.io/s/minsto-counter-kxem7?file=/src/App.js)
1. [Counter App using Local Store](https://codesandbox.io/s/minsto-counter-using-local-store-w4u4d?file=/src/App.js)
1. [Todo App](https://codesandbox.io/s/minsto-todo-app-jbs3s?file=/src/useTodoStore.js)
1. [Movie Search using Async Computed Prop](https://codesandbox.io/s/minsto-async-computed-prop-3odp6?file=/src/App.js)
1. [Animation using GSAP](https://codesandbox.io/s/minsto-tween-dwlot?file=/src/App.js)
