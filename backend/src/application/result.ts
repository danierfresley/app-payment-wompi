export type Result<T, E> = Ok<T, E> | Err<T, E>;

export class Ok<T, E> {
  readonly ok = true as const;

  constructor(public readonly value: T) {}

  map<U>(fn: (value: T) => U): Result<U, E> {
    return ok(fn(this.value));
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return fn(this.value);
  }

  mapError<F>(_fn: (error: E) => F): Result<T, F> {
    return ok(this.value);
  }

  fold<R>(onOk: (value: T) => R, _onErr: (error: E) => R): R {
    return onOk(this.value);
  }
}

export class Err<T, E> {
  readonly ok = false as const;

  constructor(public readonly error: E) {}

  map<U>(_fn: (value: T) => U): Result<U, E> {
    return err(this.error);
  }

  flatMap<U>(_fn: (value: T) => Result<U, E>): Result<U, E> {
    return err(this.error);
  }

  mapError<F>(fn: (error: E) => F): Result<T, F> {
    return err(fn(this.error));
  }

  fold<R>(_onOk: (value: T) => R, onErr: (error: E) => R): R {
    return onErr(this.error);
  }
}

export const ok = <T, E = never>(value: T): Result<T, E> => new Ok(value);
export const err = <E, T = never>(error: E): Result<T, E> => new Err(error);
