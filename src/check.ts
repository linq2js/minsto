import minsto, { Action, StoreModel } from "./index";
import task from "./task";

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
    count: 0
  },
  actions: {
    increase(store, payload) {}
  },
  plugins: {
    history: undefined as HistoryPluginModel
  },
  listeners: {
    click(args) {}
  }
});

const f1 = task((a: number, b: string) => a + b, { latest: true });
const f2 = task((a: number, b: string) => (t) => a + b, { latest: true });
const f3 = task((a: number, b: string) => Promise.resolve(a + b), {
  latest: true
});
const f4 = task((a: number, b: string) => (t) => Promise.resolve(a + b), {
  latest: true
});

console.log(
  f1(1, "a"),
  f2(1, "a"),
  f3(1, "a"),
  f4(1, "a"),
  store.increase(100),
  store.count,
  store.history.current,
  store.history.go(1),
  store.when("11")
);
