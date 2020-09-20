import minsto, { Action, StoreModel, Store, InitOptions } from "./index";
import { createStoreHook } from "./react";
import { EntitiesStoreModel, ListStoreModel } from "./extras";

interface Todo {
  id: number;
  title: string;
}

interface TodoStoreModel extends StoreModel {
  state: {
    count: number;
  };
  actions: {
    increase: Action<TodoStoreModel>;
  };
  children: {
    history: HistoryPluginModel;
    list: ListStoreModel<number>;
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

const SearchApi = "";

const store = minsto({
  state: {
    count: 0,
    results: [],
  },
  actions: {
    increase(store: Store<TodoStoreModel>, payload) {
      store.mutate("count", 1);
    },
    async search(store, keyword, task) {
      await task.debounce(300);
      const results = await task.race({
        cancel: store.when("cancel"),
        fetchSearchResults: task.call(SearchApi, keyword),
      });
      store.results = results;
    },
  },
  children: {
    history: undefined as HistoryPluginModel,
    list: undefined as ListStoreModel<number>,
    todos: undefined as EntitiesStoreModel<Todo, number>,
  },
  listeners: {
    click(args) {},
  },
  init(store?: Store<TodoStoreModel>, options?: InitOptions): any {
    store.mergeState({
      count: 0,
      history: {
        current: undefined,
      },
      list: undefined,
    });
  },
});

const useCounterStore = createStoreHook(store);
const useCounterStore2 = createStoreHook({
  state: {
    count: 0,
  },
});

function Component() {
  const count = useCounterStore((store) => store.count);
  useCounterStore2((store) => store.count);
}
//
// const t1 = createTask();
// const t2 = createTask({
//   start(task?: Task) {
//     return task;
//   },
// });

console.log(
  // t1,
  // t2,
  store.list,
  store.list.items,
  store.list.splice(),
  store.todos.ids[0],
  store.increase(100),
  store.count,
  store.history.current,
  store.history.go(1),
  store.when("11")
);
