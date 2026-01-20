import { Response } from 'express';

export class HttpHelpers {
        static sendResponse(res: Response, statusCode: number, data: any) {
                return res.status(statusCode).json({ data });
        }

        static sendError(res: Response, statusCode: number, errorMessage: any) {
                return res.status(statusCode).json({ errorMessage });
        }
}
