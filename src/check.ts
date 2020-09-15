import minsto, { Store } from "./index";
import useStore from "./react";

interface State {
  count: number;
}

function Decrease(store: Store<State>) {
  store.dispatch(Decrease);
  return 200;
}

const store = minsto({
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

const logPlugin = createLogPlugin("ac", "log");
logPlugin.ac.push("");
logPlugin.log("");

store.when("*");
store.when("*", (args) => console.log(args.action));

const r = store.dispatch(Decrease);

function MyComp() {
  return useStore(store, (state) => state.count);
}

console.log(store.increase, store.increase(1, 2), r, MyComp);
