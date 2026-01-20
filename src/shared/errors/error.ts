import { HttpStatusCodeType } from '../http/httpStatusCodes.js';

export abstract class BaseError extends Error {
        abstract type: 'Domain' | 'Infrastructure';
        public statusCode: number;
        public message: string;

        constructor(message: string, statusCode: number) {
                super(message);
                this.statusCode = statusCode;
                this.message = message;
        }
}

export class DomainError extends BaseError {
        public type: 'Domain' | 'Infrastructure' = 'Domain';
        public statusCode: number;
        public message: string;

        constructor(message: string, statusCode: number) {
                super(message, statusCode);
                this.statusCode = statusCode;
                this.message = message;
                Object.setPrototypeOf(this, BaseError);
        }
}

export class InfrastructureError extends BaseError {
        type: 'Domain' | 'Infrastructure' = 'Infrastructure';
        public statusCode: number;
        public message: string;
        public isRetryable: boolean;

        constructor(message: string, statusCode: number, isRetryable: boolean) {
                super(message, statusCode);
                this.statusCode = statusCode;
                this.message = message;
                this.isRetryable = isRetryable;
                Object.setPrototypeOf(this, BaseError);
        }
}
