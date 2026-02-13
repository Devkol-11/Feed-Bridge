import { Router, Request, Response } from 'express';
import { GetUserDashboardStats } from '../usecases/getDashBoardStats.js';
import { protectHandler } from '@src/shared/helpers/catchAsync.js';
import { HttpStatusCode } from '@src/shared/http/httpStatusCodes.js';
import { HttpHelpers } from '@src/shared/http/httpHelpers.js';
import { authorizeRole } from '@src/shared/middleware/authorizeRole.js';

export function AnalyticsRoutes(): Router {
        const analyticsRoute = Router();
        const statsUseCase = new GetUserDashboardStats();

        analyticsRoute.get(
                '/dashboard/:userId',
                authorizeRole(['USER', 'ADMIN']),
                protectHandler(async (req: Request, res: Response) => {
                        const targetUserId = req.params.userId as string;

                        // Security: Prevent standard USERS from viewing other people's IDs
                        // Assumes protectHandler attaches user data to req.user

                        const stats = await statsUseCase.execute(targetUserId);

                        return HttpHelpers.sendResponse(res, HttpStatusCode.OK, {
                                message: 'Analytics dashboard retrieved successfully',
                                stats
                        });
                })
        );

        return analyticsRoute;
}
