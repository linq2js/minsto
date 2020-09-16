export default function minsto<TModel extends StoreModel = any>(
  model?: TModel
): Store<TModel>;

export type Store<TModel = any> = ModelBaseInfer<TModel> &
  ModelPluginsInfer<TModel> &
  StoreBase<TModel>;

export type Plugin<TModel = any> = ModelBaseInfer<TModel>;

export type ModelBaseInfer<TModel> = ModelActionsInfer<TModel> &
  ModelStateInfer<TModel> &
  ModelComputedInfer<TModel>;

export interface StoreModel extends ModelBase {
  init?(store?: any): any;
  plugins?: {};
}

export interface StoreBase<TModel> {
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
    callback: Listener<ValueChangeEventArgs<TModel, TResult>>
  ): Unsubscribe;
  getState(): ModelStateInfer<TModel>;
  dispatch<TPayload, TResult>(
    action: Action<TModel, TPayload, TResult>,
    payload?: TPayload
  ): TResult;
  dynamic(prop: string): any;
  dynamic(prop: string, value: any): void;
}

export interface StateChangeEventArgs<TModel> {
  target: Store<TModel> | Plugin<TModel>;
  state: ModelStateInfer<TModel>;
}

export interface ValueChangeEventArgs<TModel, TValue>
  extends StateChangeEventArgs<TModel> {
  previous: TValue;
  current: TValue;
}

export interface DispatchEventArgs<TModel, TPayload = any> {
  type: string;
  target: Store<TModel> | Plugin<TModel>;
  payload: TPayload;
}

export type Unsubscribe = () => void;

export interface PluginModel extends ModelBase {
  init?(plugin?: any, store?: any): any;
}

export interface ModelBase {
  state?: {};
  computed?: {};
  actions?: {};
  listeners?: {
    [key: string]: Listener;
  };
}

export type Action<TModel = any, TPayload = any, TResult = void> = (
  store?: Store<TModel>,
  payload?: TPayload
) => TResult;

export type ActionBody<TModel, TPayload, TResult> = (
  store?: Store<TModel>,
  payload?: TPayload
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

export type ModelPluginsInfer<TModel> = TModel extends {
  plugins: infer TPlugins;
}
  ? { [key in keyof TPlugins]: Plugin<TPlugins[key]> }
  : {};

export type Listener<T = any> = (args: T) => any;
