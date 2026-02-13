import { DomainErrorBase } from '@src/shared/base/errorBase.js';
import { HttpStatusCode } from '@src/shared/http/httpStatusCodes.js';

export namespace DomainExceptions {
        export class JobIngestionError extends DomainErrorBase {
                constructor(
                        message: string = 'Error injesting Job',
                        statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR
                ) {
                        super(message, statusCode);
                }
        }

        export class JobSourceNotFoundException extends DomainErrorBase {
                constructor(
                        message: string = 'Job source not found',
                        statusCode: number = HttpStatusCode.NOT_FOUND
                ) {
                        super(message, statusCode);
                }
        }

        export class DuplicateJobSourceException extends DomainErrorBase {
                constructor(
                        message: string = 'Duplicate Job Source , this source already exists',
                        statusCode: number = HttpStatusCode.CONFLICT
                ) {
                        super(message, statusCode);
                }
        }
}
