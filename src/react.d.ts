import { Store, StoreStateInfer } from "./index";

declare const useStore: UseStore;

export default useStore;

export interface UseStore extends Function {
  <TDefinition>(store: Store<TDefinition>): StoreStateInfer<TDefinition>;
  <TDefinition, TResult>(
    store: Store<TDefinition>,
    selector: (state: StoreStateInfer<TDefinition>) => TResult
  ): TResult;
}
