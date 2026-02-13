import { Request, Response, NextFunction } from 'express';
import { DomainErrorBase, InfrastructureErrorBase, BaseError } from '../base/errorBase.js';
import { HttpStatusCode } from '../http/httpStatusCodes.js';
import { HttpHelpers } from '../http/httpHelpers.js';
import { ZodError } from 'zod';

export function applicationErrorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
        // Log the error for internal tracking (Use a logger like Winston/Pino in production)
        console.error(`[Error Handler] ${new Date().toISOString()}:`, {
                name: err.name,
                message: err.message,
                stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });

        // Handle Zod Validation Errors (400 Bad Request)
        if (err instanceof ZodError) {
                return HttpHelpers.sendError(res, HttpStatusCode.BAD_REQUEST, {
                        status: 'validation_error',
                        message: 'Invalid request data',
                        errors: err.flatten().fieldErrors
                });
        }

        //  Handle your Custom Domain Errors (Business Rules)
        if (err instanceof DomainErrorBase) {
                return HttpHelpers.sendError(res, err.statusCode, {
                        status: 'domain_error',
                        message: err.message
                });
        }

        // Handle Infrastructure Errors (Database, Redis, etc.)
        if (err instanceof InfrastructureErrorBase) {
                return HttpHelpers.sendError(res, err.statusCode, {
                        status: 'infrastructure_error',
                        message: err.message,
                        retryable: err.isRetryable
                });
        }

        // Handle Known Prisma Errors (e.g., Record not found, Unique constraint)
        if (err.code && err.clientVersion) {
                return HttpHelpers.sendError(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
                        status: 'database_error',
                        message: 'A database error occurred'
                        // Do not send err.message here; it contains SQL secrets
                });
        }

        // 6. Final Fallback: Unexpected Programmer Errors (500)
        const isDev = process.env.NODE_ENV === 'development';

        return HttpHelpers.sendError(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
                status: 'internal_error',
                message: isDev ? err.message : 'An unexpected error occurred. Please try again later.',
                ...(isDev && { stack: err.stack }) // Only show stack trace in dev
        });
}
