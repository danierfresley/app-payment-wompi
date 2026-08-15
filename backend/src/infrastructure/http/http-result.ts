import { HttpException } from '@nestjs/common';
import { Result } from '../../application/result';
import { DomainError } from '../../domain/errors/domain-error';

export const unwrap = <T>(result: Result<T, DomainError>): T => {
  return result.fold(
    (value) => value,
    (error) => {
      throw new HttpException(
        { code: error.code, message: error.message, details: error.details },
        error.statusCode,
      );
    },
  );
};
