import { conflict, unauthorized } from '../domain/errors/domain-error';
import { err, ok } from './result';

describe('Result', () => {
  it('maps and folds successful values', () => {
    const result = ok(2)
      .map((value) => value + 1)
      .flatMap((value) => ok(value * 2));
    expect(result.fold((value) => value, () => 0)).toBe(6);
    expect(result.mapError(() => 'x').ok).toBe(true);
  });

  it('short-circuits errors on the railway', () => {
    const result = err<string, number>('fail')
      .map((value) => value + 1)
      .flatMap((value) => ok(value))
      .mapError((error) => `${error}!`);
    expect(result.ok).toBe(false);
    expect(result.fold(() => 'ok', (error) => error)).toBe('fail!');
    expect(conflict('dup').statusCode).toBe(409);
    expect(unauthorized('nope').statusCode).toBe(401);
  });
});
