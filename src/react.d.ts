import { Store, StoreModel, Loadable } from "./index";

export default function useStore<TModel, TResult>(
  store: Store<TModel>,
  selector: (store: Store<TModel>) => TResult
): TResult;

export function createStoreHook<TModel>(
  store: Store<TModel> | TModel
): StoreHook<TModel>;

export function createStoreHook<TModel, TPayload, TResult>(
  store: Store<TModel> | TModel,
  selector: (store: Store<TModel>, payload: TPayload) => TResult
): StoreHookWithSelector<TPayload, TResult>;

export interface StoreHook<TModel> extends Function {
  <TResult>(selector: (store: Store<TModel>) => TResult): TResult;
}

export type StoreHookWithSelector<TPayload, TResult> = (
  payload?: TPayload
) => TResult;

export function useLocalStore<T extends StoreModel>(model: T): Store<T>;

export function useValue<T extends Loadable<any> | any>(
  value: T
): ValueInfer<T>;

export type ValueInfer<T> = T extends Loadable<infer TValue> ? TValue : T;
