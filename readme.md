# Minsto

A mini store for javascript/React app

## Counter App

```jsx harmony
import minsto from "minsto";
import useStore from "minsto/react";

const CounterStore = minsto({ count: 0 });

const App = () => (
  <h1 onClick={() => CounterStore.count++}>
    {useStore(CounterStore, (store) => store.count)}
  </h1>
);
```

## Performance

1. [Minsto](https://codesandbox.io/s/minsto-performance-r6bwl?file=/src/App.js)
1. [Redux](https://codesandbox.io/s/will123195redux-performance-56980)
1. [Stoze](https://codesandbox.io/s/stoze-performance-3q6ib?file=/src/index.js)
1. [Easy Peasy](https://codesandbox.io/s/easy-peasy-performance-chr7b?file=/src/App.js)

## Examples

1. [Counter App](https://codesandbox.io/s/minsto-counter-kxem7?file=/src/App.js)
