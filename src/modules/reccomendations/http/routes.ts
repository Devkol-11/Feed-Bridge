import { Router, Request, Response } from 'express';
import { HttpStatusCode } from '@src/shared/http/httpStatusCodes.js';
import { HttpHelpers } from '@src/shared/http/httpHelpers.js';
import { protectHandler } from '@src/shared/helpers/catchAsync.js';
import { recommendations_usecase_http } from '../recommendations.module.js';
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

                        await recommendations_usecase_http.generateRecommendationResult.execute({ userId });

                        return HttpHelpers.sendResponse(res, HttpStatusCode.OK, {
                                message: 'Recommendations updated successfully.'
                        });
                })
        );

        recommendationRoutes.get(
                '/',
                authorizeRole(['USER', 'ADMIN']),
                protectHandler(async (req: Request, res: Response) => {
                        const userId = (req as any).user.id;
                        const results = await recommendations_usecase_http.getUserRecommendations.execute(
                                userId
                        );

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

                        const reason = await recommendations_usecase_http.getRecommendationReason.execute(
                                userId,
                                jobId
                        );

                        return HttpHelpers.sendResponse(res, HttpStatusCode.OK, reason);
                })
        );

        return recommendationRoutes;
}
