import { Store, ModelStateInfer } from "./index";

declare const useStore: UseStore;

export default useStore;

export interface UseStore extends Function {
  <TModel>(store: Store<TModel>): ModelStateInfer<TModel>;
  <TModel, TResult>(
    store: Store<TModel>,
    selector: (store: Store<TModel>) => TResult
  ): TResult;
}
