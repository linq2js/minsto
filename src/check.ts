import minsto, { Action, StoreModel, createTask, Task, Store } from "./index";

interface TodoStoreModel extends StoreModel {
  state: {
    count: number;
  };
  actions: {
    increase: Action<TodoStoreModel>;
  };
}

interface HistoryPluginModel<TEntry = any> {
  state: {
    current: TEntry;
  };

  actions: {
    back(): void;
    forward(): void;
    go(store: any, number: number): void;
  };
}

const store = minsto({
  state: {
    count: 0,
  },
  actions: {
    increase(store: Store<TodoStoreModel>, payload) {
      store.mutate("count", 1);
    },
  },
  plugins: {
    history: undefined as HistoryPluginModel,
  },
  listeners: {
    click(args) {},
  },
});

const t1 = createTask();
const t2 = createTask({
  start(task?: Task) {
    return task;
  },
});

console.log(
  t1,
  t2,
  store.increase(100),
  store.count,
  store.history.current,
  store.history.go(1),
  store.when("11")
);
