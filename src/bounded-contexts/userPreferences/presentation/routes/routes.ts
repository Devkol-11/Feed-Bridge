import { Router, Request, Response } from 'express';
import { HttpStatusCode } from '@src/shared/http/httpStatusCodes.js';
import { HttpHelpers } from '@src/shared/http/httpHelpers.js';
import { usecaseHttp } from '../../userPreference.module.js';
import { authorizeRole } from '@src/shared/middleware/authorizeRole.js';
import { protectHandler } from '@src/shared/helpers/catchAsync.js';

export function UserPreferenceRoutes(): Router {
        const userPreferenceRoutes = Router();

        userPreferenceRoutes.use(authorizeRole(['USER', 'ADMIN']));

        userPreferenceRoutes.post(
                '/',
                protectHandler(async (req: Request, res: Response) => {
                        const userId = (req as any).user.id;
                        const { categories, locations, minimumSalary, isAlertsEnabled } = req.body;

                        await usecaseHttp.createUserPreference.execute({
                                userId,
                                categories,
                                locations,
                                minimumSalary,
                                isAlertsEnabled
                        });

                        return HttpHelpers.sendResponse(res, HttpStatusCode.CREATED, {
                                message: 'Preferences created successfully'
                        });
                })
        );

        userPreferenceRoutes.patch(
                '/filters',
                protectHandler(async (req: Request, res: Response) => {
                        const userId = (req as any).user.id;
                        const { categories, locations, minimumSalary } = req.body;

                        await usecaseHttp.updateUserPreference.execute({
                                userId,
                                categories,
                                locations,
                                minimumSalary
                        });

                        return HttpHelpers.sendResponse(res, HttpStatusCode.OK, {
                                message: 'Filters updated successfully'
                        });
                })
        );

        userPreferenceRoutes.post(
                '/alerts',
                protectHandler(async (req: Request, res: Response) => {
                        const userId = (req as any).user.id;
                        const { isEnabled } = req.body;

                        await usecaseHttp.toggleAlerts.execute({
                                userId,
                                isEnabled
                        });

                        return HttpHelpers.sendResponse(res, HttpStatusCode.OK, {
                                message: `Alerts ${isEnabled ? 'enabled' : 'disabled'} successfully`
                        });
                })
        );

        userPreferenceRoutes.get(
                '/matching-count',
                protectHandler(async (req: Request, res: Response) => {
                        const userId = (req as any).user.id;

                        const count = await usecaseHttp.getMatchingJobsCount.execute(userId);

                        return HttpHelpers.sendResponse(res, HttpStatusCode.OK, { count });
                })
        );

        userPreferenceRoutes.get(
                '/find-matches',
                protectHandler(async (req: Request, res: Response) => {
                        const { category, location } = req.query;

                        const userIds = await usecaseHttp.findUsersMatchingJob.execute({
                                category: String(category),
                                location: String(location)
                        });

                        return HttpHelpers.sendResponse(res, HttpStatusCode.OK, { userIds });
                })
        );

        return userPreferenceRoutes;
}
