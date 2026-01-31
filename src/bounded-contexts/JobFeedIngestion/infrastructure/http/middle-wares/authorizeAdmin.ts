import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HttpHelpers } from '@src/shared/http/httpHelpers.js';
import { HttpStatusCode } from '@src/shared/http/httpStatusCodes.js';
import { getEnv } from '@src/config/env/env.js';

const config = getEnv();

export function authorizeAdmin(requiredRole: string = 'ADMIN') {
        return (req: Request, res: Response, next: NextFunction) => {
                try {
                        // 1. Get the token from the header
                        const authHeader = req.headers.authorization;

                        if (!authHeader || !authHeader.startsWith('Bearer ')) {
                                return HttpHelpers.sendResponse(res, HttpStatusCode.UNAUTHORIZED, {
                                        message: 'No token provided'
                                });
                        }

                        const token = authHeader.split(' ')[1];

                        // 2. Verify the token (Use your actual Secret Key)
                        // The "decoded" object is your JWT Payload (claims)
                        const decoded = jwt.verify(token, config.JWT_SECRET) as {
                                id: string;
                                email: string;
                                role: string;
                        };

                        // 3. Check the role inside the claims
                        // Assuming your JWT payload looks like: { id: "123", role: "ADMIN" }
                        if (decoded.role !== requiredRole) {
                                return HttpHelpers.sendResponse(res, HttpStatusCode.FORBIDDEN, {
                                        message: `Requires ${requiredRole} role`
                                });
                        }

                        // 4. Success! Attach the user to the request so the Use Case can see "Who" did it
                        (req as any).user = decoded;

                        // Move to the next function in the route
                        next();
                } catch (error) {
                        // Token expired or malformed
                        return HttpHelpers.sendResponse(res, HttpStatusCode.UNAUTHORIZED, {
                                message: 'Invalid or expired token'
                        });
                }
        };
}
