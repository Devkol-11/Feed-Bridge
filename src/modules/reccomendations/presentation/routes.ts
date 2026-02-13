import { Router, Request, Response } from 'express';
import { HttpStatusCode } from '@src/shared/http/httpStatusCodes.js';
import { HttpHelpers } from '@src/shared/http/httpHelpers.js';
import { protectHandler } from '@src/shared/helpers/catchAsync.js';
import { usecaseHttp } from '../recommendations.module.js';
import { authorizeRole } from '@src/shared/middleware/authorizeRole.js';

export function RecommendationRoutes(): Router {
        const recommendationRoutes = Router();

        /**
         * POST /recommendations
         * Generates/Refreshes recommendations for the authenticated user.
         */
        recommendationRoutes.post(
                '/',
                authorizeRole(['USER', 'ADMIN']),
                protectHandler(async (req: Request, res: Response) => {
                        const userId = (req as any).user.id;

                        await usecaseHttp.generateRecommendationResult.execute({ userId });

                        return HttpHelpers.sendResponse(res, HttpStatusCode.OK, {
                                message: 'Recommendations updated successfully.'
                        });
                })
        );

        /**
         * POST /recommendations/recompute-all
         * System-wide trigger to refresh everyone's feed.
         restricted  to ADMIN only.
         */
        recommendationRoutes.post(
                '/recompute-all',
                authorizeRole('ADMIN'),
                protectHandler(async (req: Request, res: Response) => {
                        // Trigger the batch command
                        const result = await usecaseHttp.recomputeAllRecommendations.execute();

                        return HttpHelpers.sendResponse(res, HttpStatusCode.OK, {
                                message: 'Batch recomputation complete.',
                                processedUsers: result.processedUsers
                        });
                })
        );

        recommendationRoutes.get(
                '/',
                authorizeRole(['USER', 'ADMIN']),
                protectHandler(async (req: Request, res: Response) => {
                        const userId = (req as any).user.id;
                        const results = await usecaseHttp.getUserRecommendations.execute(userId);

                        return HttpHelpers.sendResponse(res, HttpStatusCode.OK, results);
                })
        );

        /**
         * GET /recommendations/:jobId/reason
         * Returns the "Why" for a specific job match.
         */
        recommendationRoutes.get(
                '/:jobId/reason',
                authorizeRole(['USER', 'ADMIN']),
                protectHandler(async (req: Request, res: Response) => {
                        const userId = (req as any).user.id;
                        const jobId = req.params.jobId as string;
                        if (typeof jobId !== 'string') {
                                return HttpHelpers.sendResponse(res, HttpStatusCode.BAD_REQUEST, {
                                        message: 'Invalid Job ID provided'
                                });
                        }

                        const reason = await usecaseHttp.getRecommendationReason.execute(userId, jobId);

                        return HttpHelpers.sendResponse(res, HttpStatusCode.OK, reason);
                })
        );

        return recommendationRoutes;
}
