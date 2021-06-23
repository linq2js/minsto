export default function minsto<TModel extends StoreModel = any>(
  model?: TModel
): Store<TModel>;

export type Store<TModel = any> = StoreBase<TModel> &
  ModelChildrenInfer<TModel> &
  ModelActionsInfer<TModel> &
  ModelStateInfer<TModel> &
  ModelComputedInfer<TModel> &
  ModelWatchersInfer<TModel>;

export interface StoreModel {
  name?: string;
  state?: {};
  merge?(store: any, nextState: any): void;
  computed?: {};
  actions?: {};
  listeners?: {
    [key: string]: Listener;
  };
  watchers?: {
    [key: string]: Listener<ValueChangeEventArgs<any, any>>;
  };
  isolate?: boolean;
  onChange?(store?: any): void;
  init?(store?: any, options?: InitOptions): any;
  children?: {};
}

export interface InitOptions {
  parent?: Store;
  initial?: any;
}

export interface StoreBase<TModel> {
  readonly name: string;
  readonly loading: boolean;
  readonly error: any;
  onChange(listener: Listener<StateChangeEventArgs<TModel>>): Unsubscribe;
  onDispatch(listener: Listener<DispatchEventArgs<TModel>>): Unsubscribe;

  when<TPayload>(action: string | (Action | string)[]): Promise<TPayload>;
  when(
    action: string | (Action | string)[],
    callback: Listener<DispatchEventArgs<TModel>>
  ): Unsubscribe;
  when(listeners: {
    [key: string]: Listener<DispatchEventArgs<TModel>>;
  }): Unsubscribe;
  watch(
    prop: string,
    callback: Listener<ValueChangeEventArgs<TModel, any>>
  ): Unsubscribe;
  watch(
    props: string[],
    callback: Listener<ValueChangeEventArgs<TModel, { [key: string]: any }>>
  ): Unsubscribe;
  watch<TResult>(
    selector: (state: ModelStateInfer<TModel>) => TResult,
    callback: Listener<ValueChangeEventArgs<TModel, TResult>>,
    options?: WatchOptions
  ): Unsubscribe;
  getState(): ModelStateInfer<TModel>;
  mergeState(
    state: ModelStateInfer<TModel> & ModelChildStateInfer<TModel>
  ): void;
  mergeState(
    state: ModelStateInfer<TModel> & ModelChildStateInfer<TModel>,
    applyToAllChildren: boolean
  ): void;
  dispatch<TPayload, TResult>(
    action: Action<TModel, TPayload, TResult>,
    payload?: TPayload
  ): TResult;
  $(props: { [key: string]: any }): void;
  $(prop: string): any;
  $(
    prop: string,
    value: ((value: any, loadable?: Loadable<any>) => any) | any
  ): void;
  lock<T>(
    props: keyof TModel | string | (string | keyof TModel)[],
    promise: Promise<T>
  ): void;
  mutate<
    TKey extends keyof ModelStateInfer<TModel>,
    TValue extends ModelStateInfer<TModel>[TKey]
  >(
    prop: TKey,
    value: ((prev: TValue) => TValue) | TValue
  ): void;
  loadableOf<TProp extends keyof ModelStateInfer<TModel>>(
    prop: TProp
  ): Loadable<ModelStateInfer<TModel>[TProp]>;
  loadableOf(prop: string): Loadable<any>;
  callback<TCallback extends Function>(
    fn: TCallback,
    ...cacheKeys: any[]
  ): TCallback;
}

export interface Loadable<T> {
  readonly value: T;
  readonly status: "loading" | "hasError" | "hasValue";
  readonly error: any;
  readonly promise: Promise<any>;
  readonly loading: boolean;
  readonly hasError: boolean;
  readonly hasValue: boolean;
}

export interface StateChangeEventArgs<TModel> {
  store: Store<TModel>;
  state: ModelStateInfer<TModel>;
}

export interface ValueChangeEventArgs<TModel, TValue>
  extends StateChangeEventArgs<TModel> {
  previous: TValue;
  current: TValue;
}

export interface DispatchEventArgs<TModel, TPayload = any> {
  type: string;
  store: Store<TModel>;
  payload: TPayload;
}

export type Unsubscribe = () => void;

export type Action<TModel = any, TPayload = any, TResult = void> = (
  store?: Store<TModel>,
  payload?: TPayload,
  task?: Task
) => TResult;

export type ActionBody<TModel, TPayload, TResult> = (
  store?: Store<TModel>,
  payload?: TPayload,
  task?: Task
) => TResult;

export type ModelActionsInfer<TModel> = TModel extends {
  actions: infer TActions;
}
  ? { [key in keyof TActions]: ActionDispatcherInfer<TActions[key]> }
  : {};

export type ModelStateInfer<TModel> = TModel extends { state: infer TState }
  ? { [key in keyof TState]: TState[key] }
  : {};

export type ActionDispatcherInfer<TAction> = TAction extends Action<
  any,
  infer TPayload,
  infer TResult
>
  ? (payload?: TPayload) => TResult
  : never;

export type ModelComputedInfer<TModel> = TModel extends {
  state: infer TComputed;
}
  ? { [key in keyof TComputed]: any }
  : {};

export type ModelChildrenInfer<TModel> = TModel extends {
  children: infer TChildren;
}
  ? { [key in keyof TChildren]: Store<TChildren[key]> }
  : {};

export type ModelChildStateInfer<TModel> = TModel extends {
  children: infer TChildren;
}
  ? { [key in keyof TChildren]: ModelStateInfer<TChildren[key]> }
  : {};

export type Listener<T = any> = (args?: T, task?: Task) => any;

export interface Cancellable {
  cancelled(): boolean;
  cancel(): void;
}

export interface Task extends Cancellable {
  wrap<T>(promise: Promise<T>): Promise<T> & Cancellable;
  wrap<T extends Function>(fn: T): T;
  delay(ms: number, fn?: Function): Promise<void> & Cancellable;
  debounce(ms: number): Promise<void> & Cancellable;
  latest(): void;
  call<T extends (...args: any[]) => any>(
    fn: T,
    ...args: Parameters<T>
  ): CallResultInfer<ReturnType<T>>;
  create<TResult>(fn: (subTask?: Task) => TResult): TResult;
  create(): Task;
  onCancel(callback: Function): Unsubscribe;
  all(
    targets: Promise<any>[],
    callback?: (results?: any[]) => any
  ): Promise<any[]> & Cancellable;
  race<
    T extends { [key: string]: Promise<any> },
    TResult extends { [key in keyof T]: any }
  >(
    targets: T,
    callback?: (results?: TResult) => any
  ): Promise<TResult> & Cancellable;
}

export type CallResultInfer<T> = T extends Promise<infer TResolved>
  ? Promise<TResolved> & Cancellable
  : T;

export interface WatchOptions {
  initial: boolean;
}

export type ModelWatchersInfer<TModel> = {};
