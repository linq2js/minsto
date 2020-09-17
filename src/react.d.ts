import { Store } from "./index";

declare const useStore: UseStore;

export default useStore;

export interface UseStore extends StoreHook {
  <TModel, TResult>(
    store: Store<TModel>,
    selector: (store: Store<TModel>) => TResult
  ): TResult;
  create<TModel>(store: Store<TModel>): StoreHookWrapper<TModel>;
  create<TModel, TPayload, TResult>(
    store: Store<TModel>,
    selector: (store: Store<TModel>, payload: TPayload) => TResult
  ): (payload?: TPayload) => TResult;
}

export interface StoreHookWrapper<TModel> extends Function {
  <TResult>(selector: (store: Store<TModel>) => TResult): TResult;
}

export interface StoreHook extends Function {
  <TModel, TResult>(
    store: Store<TModel>,
    selector: (store: Store<TModel>) => TResult
  ): TResult;
}
