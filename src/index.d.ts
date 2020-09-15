export default function minsto<T>(definition: T): Store<T>;

export type Store<T> = StoreBase<T> & StorePropsInfer<T>;

export type StoreStateInfer<T> = {
    [key in keyof T]: StoreStatePropInfer<T[key]>;
};

export type StoreStatePropInfer<T> = T extends (...args: any[]) => any
    ? never
    : T;

export interface StoreBase<TDefinition = any> {
    dispatch<TPayload, TResult>(
        action: Action<TDefinition, TPayload, TResult>,
        payload?: TPayload
    ): TResult;
    subscribe(
        subscription: (args: {
            store: Store<TDefinition>;
            state: StoreStateInfer<TDefinition>;
        }) => any
    ): Unsubscribe;
    when(actionName: "*" | string): Promise<any>;
    when<TPayload, TResult>(
        action: Action<TDefinition, TPayload, TResult>
    ): Promise<any>;
    when<TAction extends Action<TDefinition>>(
        action: TAction,
        callback: (args: { store: Store<TDefinition>; action: TAction }) => any
    ): Unsubscribe;
    when(
        actionName: "*" | string,
        callback: (args: { store: Store<TDefinition>; action: Function }) => any
    ): Unsubscribe;
    use<TPlugin>(plugin: TPlugin): Store<TDefinition & TPlugin>;
}

export type Action<TDefinition, TPayload = any, TResult = any> = (
    store?: Store<TDefinition>,
    payload?: TPayload
) => TResult;

export type Unsubscribe = () => void;

export type StorePropsInfer<TDefinition> = {
    [key in keyof TDefinition]: StorePropInfer<TDefinition, TDefinition[key]>;
};

export type StorePropInfer<TDefinition, TPropType> = TPropType extends (
    store: Store<TDefinition>,
    ...args: infer TArgs
    ) => infer TResult
    ? (...args: TArgs) => TResult
    : TPropType;
