import { HttpException } from '@nestjs/common';
import { err, ok } from '../../application/result';
import { notFound } from '../../domain/errors/domain-error';
import { unwrap } from './http-result';

describe('unwrap', () => {
  it('returns the value on success', () => {
    expect(unwrap(ok({ id: 1 }))).toEqual({ id: 1 });
  });

  it('throws an http exception on domain errors', () => {
    expect(() => unwrap(err(notFound('missing')))).toThrow(HttpException);
  });
});
