import { DomainErrorBase } from '@src/shared/base/errorBase.js';
import { HttpStatusCode } from '@src/shared/http/httpStatusCodes.js';

export namespace JobTrackingException {
        export class ApplicationNotFound extends DomainErrorBase {
                constructor(message: string, statusCode: number = HttpStatusCode.BAD_REQUEST) {
                        super(message, statusCode);
                }
        }

        export class UnauthorizedAccess extends DomainErrorBase {
                constructor(
                        message: string = ' Unauthorized access',
                        statusCode: number = HttpStatusCode.FORBIDDEN
                ) {
                        super(message, statusCode);
                }
        }
}
