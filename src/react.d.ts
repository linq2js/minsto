import { Store, StoreModel } from "./index";

export default function useStore<TModel, TResult>(
  store: Store<TModel>,
  selector: (store: Store<TModel>) => TResult
): TResult;

export function createComponentStore<TModel>(
  store: Store<TModel>
): ComponentStore<TModel>;

export function createComponentStore<TModel, TPayload, TResult>(
  store: Store<TModel>,
  selector: (store: Store<TModel>, payload: TPayload) => TResult
): ComponentStoreWithSelector<TPayload, TResult>;

export interface ComponentStore<TModel> extends Function {
  <TResult>(selector: (store: Store<TModel>) => TResult): TResult;
}

export type ComponentStoreWithSelector<TPayload, TResult> = (
  payload?: TPayload
) => TResult;

export function useLocalStore<T extends StoreModel>(model: T): Store<T>;
