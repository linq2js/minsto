import { Action, Task } from "./index";

export function Task(): Task;
export function Task<TResult>(
  options: TaskOptions & { start(task?: Task): TResult }
): TResult;

export function Entities<
  TEntity = any,
  TId extends string | number = any,
  TSlice extends { [key in keyof TEntity]: (entity: TEntity) => any } = any
>(
  initial?: TEntity[],
  options?: {
    selectId?(entity: TEntity): TId;
    slice?: TSlice;
    equal?: EqualityComparer<any>;
  }
): EntitiesStoreModel<TEntity, TId, TSlice>;

export interface TaskOptions {
  last?: Task;
}

export interface EntitiesStoreModel<
  TEntity = any,
  TId extends string | number = any,
  TSlice = any
> {
  state: {
    get(): TEntity[];
    get<TName extends keyof TSlice>(
      sliceName: TName
    ): SliceResultInfer<TEntity, TSlice[TName]>;
    ids: TId[];
    entities: { [key in TId]: TEntity };
  };
  actions: {
    update: Action<any, Partial<TEntity> | Partial<TEntity>[]>;
    remove: Action<any, TId> | Action<any, TId[]>;
  };
}

export type EqualityComparer<T> = (a: T, b: T) => boolean;

export type SliceResultInfer<TEntity, TSelector> = TSelector extends (
  entity?: TEntity
) => infer TResult
  ? TResult[]
  : never;
