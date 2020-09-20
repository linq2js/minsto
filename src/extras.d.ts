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

export function List<TItem = any>(items?: TItem[]): ListStoreModel<TItem>;

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

export interface ListStoreModel<TItem> {
  state: {
    items: TItem[];
  };
  actions: {
    push: Action<ListStoreModel<TItem>, TItem>;
    pushArray: Action<ListStoreModel<TItem>, TItem[]>;
    pop: Action<ListStoreModel<TItem>, TItem | undefined>;
    shift: Action<ListStoreModel<TItem>, TItem | undefined>;
    unshiftArray: Action<ListStoreModel<TItem>, TItem[]>;
    unshift: Action<ListStoreModel<TItem>, TItem>;
    sort: Action<ListStoreModel<TItem>, (a: TItem, b: TItem) => any>;
    orderBy: Action<ListStoreModel<TItem>, (item: TItem) => any>;
    swap: Action<ListStoreModel<TItem>, { from: number; to: number }>;
    splice: Action<
      ListStoreModel<TItem>,
      { index: number; length?: number; items?: TItem[] },
      TItem[]
    >;
    set: Action<ListStoreModel<TItem>, { index: number; value: TItem }>;
  };
}

export function History<TEntry = any>(
  prop: string,
  options?: HistoryStoreOptions<TEntry>
): HistoryStoreModel<TEntry>;

export function History<TEntry = any>(
  props: (keyof TEntry)[],
  options?: HistoryStoreOptions<TEntry>
): HistoryStoreModel<TEntry>;

export interface HistoryStoreOptions<TEntry> {
  entries?: TEntry[];
  index?: number;
}

export interface HistoryStoreModel<TEntry> {
  state: {
    current: TEntry;
    next: TEntry;
    prev: TEntry;
    entries: TEntry[];
    index: number;
    prevEntries: TEntry[];
    nextEntries: TEntry[];
  };
  actions: {
    go: Action<HistoryStoreModel<TEntry>, number, void>;
    back: Action<HistoryStoreModel<TEntry>, never, void>;
    forward: Action<HistoryStoreModel<TEntry>, never, void>;
    clear: Action<HistoryStoreModel<TEntry>, never, void>;
  };
}
