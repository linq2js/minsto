import minsto, { Store, Plugin } from "./index";
import useStore from "./react";

interface State {
  count: number;
}

function Decrease(store: Store<State>) {
  store.dispatch(Decrease);
  return 200;
}

const store = minsto({
  $computed: {
    name: "aaa",
  },
  count: 0,
  increase(store: Store<State>, a: number, b: number): number {
    console.log(store, a, b);
    return 100;
  },
});

function createLogPlugin<TLogName extends string, TLogAction extends string>(
  logPropName: TLogName,
  logActionName: TLogAction
): { [key in TLogName]: string[] } &
  { [key in TLogAction]: (data: string) => void } {
  console.log(logActionName, logPropName);
  return undefined;
}

interface CounterModel {
  count: number;
  increase(store: Store<CounterModel>): void;
  decrease(store: Store<CounterModel>): void;
}

function CounterPlugin(plugin: Plugin<CounterModel>) {
  return {
    count: 0,
    $computed: {
      double: () => plugin.count * 2,
    },
    increase() {},
    decrease() {
      plugin.count--;
    },
  };
}

const s1 = minsto().use("counter", CounterPlugin);

console.log(s1.counter.count, s1.counter.increase());

const logPlugin = createLogPlugin("ac", "log");
logPlugin.ac.push("");
logPlugin.log("");

store.when("*");
store.when("*", (args) => console.log(args.action));

const r = store.dispatch(Decrease);

function MyComp() {
  return useStore(store, (state) => [state.count, state.name]);
}

console.log(store.increase, store.increase(1, 2), r, MyComp, store.name);
