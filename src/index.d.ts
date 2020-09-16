export default function minsto<TModel>(model?: TModel): Store<TModel>;

export type Store<TModel> = StoreBase<TModel> & StorePropsInfer<TModel>;

export type StorePropsInfer<TModel> = StoreMainPropsInfer<
  Omit<TModel, "$computed">
> &
  StoreExtraPropsInfer<TModel>;

export type StoreExtraPropsInfer<TModel> = TModel extends {
  $computed: infer TComputed;
}
  ? { [key in keyof TComputed]: any }
  : {};

export type StoreStateInfer<TModel> = {
  [key in keyof TModel]: StoreStatePropInfer<TModel[key]>;
} &
  StoreExtraPropsInfer<TModel>;

export type StoreStatePropInfer<T> = T extends (...args: any[]) => any
  ? never
  : T;

export interface StoreBase<TModel = any> {
  dispatch<TPayload, TResult>(
    action: Action<TModel, TPayload, TResult>,
    payload?: TPayload
  ): TResult;
  subscribe(
    subscription: (args: {
      store: Store<TModel>;
      state: StoreStateInfer<TModel>;
    }) => any
  ): Unsubscribe;
  getState(): StoreStateInfer<TModel>;
  when(actionName: "*" | string): Promise<any>;
  when<TPayload, TResult>(
    action: Action<TModel, TPayload, TResult>
  ): Promise<any>;
  when<TAction extends Action<TModel>>(
    action: TAction,
    callback: (args: { store: Store<TModel>; action: TAction }) => any
  ): Unsubscribe;
  when(
    actionName: "*" | string,
    callback: (args: { store: Store<TModel>; action: Function }) => any
  ): Unsubscribe;
  use<TPlugin>(
    plugin: TPlugin | ((plugin?: any) => TPlugin)
  ): Store<TModel & TPlugin>;
  use<TPlugin, TKey extends string>(
    name: TKey,
    plugin: TPlugin | ((plugin?: any) => TPlugin)
  ): Store<TModel> & { [key in TKey]: StorePropsInfer<TPlugin> };
  watch<T = any>(
    selector: (state: StoreStateInfer<TModel>) => T,
    callback: (args?: {
      value: T;
      state: StoreStateInfer<TModel>;
      store: Store<TModel>;
    }) => any
  ): Unsubscribe;
}

export type Plugin<TModel = any> = StorePropsInfer<TModel>;

export type Action<TModel, TPayload = any, TResult = any> = (
  store?: Store<TModel>,
  payload?: TPayload
) => TResult;

export type Unsubscribe = () => void;

export type StoreMainPropsInfer<TModel> = {
  [key in keyof TModel]: StorePropInfer<TModel, TModel[key]>;
};

export type StorePropInfer<TModel, TPropType> = TPropType extends (
  store: Store<TModel>,
  ...args: infer TArgs
) => infer TResult
  ? (...args: TArgs) => TResult
  : TPropType;
