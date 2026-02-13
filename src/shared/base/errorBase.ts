export abstract class BaseError extends Error {
        abstract readonly type: 'Application_Error' | 'Infrastructure_Error';

        constructor(public message: string, public statusCode: number) {
                super(message);
                Error.captureStackTrace(this, this.constructor);
        }
}

export class ApplicationError extends BaseError {
        readonly type = 'Application_Error';

        constructor(message: string, statusCode: number) {
                super(message, statusCode);
                Object.setPrototypeOf(this, ApplicationError.prototype);
        }
}

export class InfrastructureError extends BaseError {
        readonly type = 'Infrastructure_Error';

        constructor(message: string, statusCode: number, public readonly isRetryable: boolean) {
                super(message, statusCode);
                Object.setPrototypeOf(this, InfrastructureError.prototype);
        }
}
