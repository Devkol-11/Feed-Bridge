import { IDomainEvents } from '@src/shared/ddd/domainEvents.Base.js';
import { DomainError } from '@src/shared/errors/error.js';
import { HttpStatusCode } from '@src/shared/http/httpStatusCodes.js';

export namespace DomainErrors {
        export class UserAlreadyExistsError extends DomainError {
                constructor(
                        readonly message = 'This user already exists',
                        statusCode = HttpStatusCode.CONFLICT
                ) {
                        super(message, statusCode);
                        this.message = message;
                        this.statusCode = statusCode;
                }
        }

        export class UserNotFoundError extends DomainError {
                constructor(readonly message = 'User not found', statusCode = HttpStatusCode.NOT_FOUND) {
                        super(message, statusCode);
                        this.message = message;
                        this.statusCode = statusCode;
                }
        }

        export class UserRegistrationError extends DomainError {
                constructor(
                        message = 'Something went wrong , please try again',
                        statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR
                ) {
                        super(message, statusCode);
                        this.message = message;
                        this.statusCode = statusCode;
                }
        }

        export class InvalidCredentialsError extends DomainError {
                constructor(message = 'invalid credentials', statusCode = HttpStatusCode.BAD_REQUEST) {
                        super(message, statusCode);
                        this.message = message;
                        this.statusCode = statusCode;
                }
        }

        export class InvalidResetTokenError extends DomainError {
                constructor(message = 'Invalid Token', statusCode = HttpStatusCode.BAD_REQUEST) {
                        super(message, statusCode);
                        this.message = message;
                        this.statusCode = statusCode;
                }
        }

        export class InvalidRefreshTokenError extends DomainError {
                constructor(message = 'Invalid Token', statusCode = HttpStatusCode.BAD_REQUEST) {
                        super(message, statusCode);
                        this.message = message;
                        this.statusCode = statusCode;
                }
        }
}
