import { Request, Response, NextFunction } from 'express';
import { BaseError } from '../errors/error.js';
import { HttpStatusCode, HttpStatusCodeType } from '../http/httpStatusCodes.js';
import { HttpHelpers } from '../http/httpHelpers.js';

export function applicationErrorHandler(
        err: BaseError & Error,
        _req: Request,
        res: Response,
        _next: NextFunction
) {
        console.error(err.message);
        console.error(err.stack);
        if (err instanceof BaseError) {
                if ((err.type = 'Domain')) {
                        const statusCode = err.statusCode;
                        const message = err.message;
                        HttpHelpers.sendError(res, statusCode, { error: message });
                }
                if ((err.type = 'Infrastructure')) {
                        const statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR;
                        const errorMessage = 'Internal Server Error';
                        HttpHelpers.sendError(res, statusCode, { error: errorMessage });
                }
        }
        if (err instanceof Error) {
                HttpHelpers.sendError(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
                        message: 'Please try again later',
                        error: err
                });
        }
}
