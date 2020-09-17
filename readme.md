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
1. React Native supported
1. Hot Reloading supported
1. Reactotron supported

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
