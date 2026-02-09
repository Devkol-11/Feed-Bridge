import { DomainErrorBase } from '@src/shared/errors/error.js';
import { HttpStatusCode } from '@src/shared/http/httpStatusCodes.js';

export namespace UserPreferenceDomainExceptions {
        export class PreferenceNotFound extends DomainErrorBase {
                constructor(
                        message = 'You have no preferences set',
                        statusCode: number = HttpStatusCode.BAD_REQUEST
                ) {
                        super(message, statusCode);
                }
        }
}
