export default function task<T extends (...args: any[]) => any>(
  fn: T,
  options?: TaskOptions
): (...args: Parameters<T>) => TaskResultInfer<ReturnType<T>>;

export interface Task extends Cancellable {
  wrap<T>(promise: Promise<T>): Promise<T> & Cancellable;
  call<T extends (...args: any[]) => any>(
    fn: T,
    ...args: Parameters<T>
  ): ReturnType<T>;
  delay(ms: number): Promise<void> & Cancellable;
}

export interface Cancellable {
  cancelled(): boolean;
  cancel(): void;
}

export interface TaskOptions {
  latest?: boolean;
  delay?: number;
}

export type TaskResultInfer<T> = CancellableInfer<
  T extends (task?: Task) => infer TResult ? TResult : T
>;

export type CancellableInfer<T> = T extends Promise<infer TResolved>
  ? Promise<TResolved> & Cancellable
  : T;
