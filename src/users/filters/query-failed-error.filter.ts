import {
  ArgumentsHost,
  Catch,
  ConflictException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class QueryFailedErrorFilter extends BaseExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost): void {
    if (
      exception.message.includes(
        'duplicate key value violates unique constraint',
      )
    ) {
      super.catch(new ConflictException('duplicate'), host);
    }
    if (
      exception.message.includes(
        'could not serialize access due to concurrent update',
      )
    ) {
      super.catch(
        new ConflictException(
          'could not serialize access due to concurrent update',
        ),
        host,
      );
    }
    super.catch(new UnprocessableEntityException(), host);
  }
}
