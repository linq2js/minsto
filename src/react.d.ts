import { Store, StoreStateInfer } from "./index";

declare const useStore: UseStore;

export default useStore;

export interface UseStore extends Function {
  <TModel>(store: Store<TModel>): StoreStateInfer<TModel>;
  <TModel, TResult>(
    store: Store<TModel>,
    selector: (state: StoreStateInfer<TModel>) => TResult
  ): TResult;
}
