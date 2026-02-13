import { Router, Request, Response } from 'express';
import { HttpStatusCode } from '@src/shared/http/httpStatusCodes.js';
import { HttpHelpers } from '@src/shared/http/httpHelpers.js';
import { protectHandler } from '@src/shared/helpers/catchAsync.js';
import { authorizeRole } from '@src/shared/middleware/authorizeRole.js';
import { usecaseHttp } from '../aiAssistance.module.js';

export function AiAssistanceRoutes(): Router {
        const aiRoutes = Router();

        // --- AI GENERATION & MODIFICATION (Commands) ---

        /**
         * POST /ai-assistance/improve
         * Action: Rewrites a specific section for better impact.
         */
        aiRoutes.post(
                '/improve',
                authorizeRole(['USER', 'ADMIN']),
                protectHandler(async (req: Request, res: Response) => {
                        const userId = (req as any).user.id;
                        const { resumeId, sectionType, content } = req.body;

                        const result = await usecaseHttp.improveSection.execute({
                                userId,
                                resumeId,
                                sectionType,
                                content
                        });

                        return HttpHelpers.sendResponse(res, HttpStatusCode.OK, { improvedContent: result });
                })
        );

        /**
         * POST /ai-assistance/tailor
         * Action: Modifies the resume to align with a job description.
         */
        aiRoutes.post(
                '/tailor',
                authorizeRole(['USER', 'ADMIN']),
                protectHandler(async (req: Request, res: Response) => {
                        const userId = (req as any).user.id;
                        const { resumeId, jobId, resumeSnapshot, jobDescription } = req.body;

                        const result = await usecaseHttp.tailorResume.execute({
                                userId,
                                resumeId,
                                jobId,
                                resumeSnapshot,
                                jobDescription
                        });

                        return HttpHelpers.sendResponse(res, HttpStatusCode.OK, result);
                })
        );

        /**
         * POST /ai-assistance/extract-requirements
         * Action: Analyzes job descriptions for skills and seniority.
         */
        aiRoutes.post(
                '/extract-requirements',
                authorizeRole(['USER', 'ADMIN']),
                protectHandler(async (req: Request, res: Response) => {
                        const { jobId, jobDescription } = req.body;

                        const result = await usecaseHttp.extractJobRequirements.execute({
                                jobId,
                                jobDescription
                        });

                        return HttpHelpers.sendResponse(res, HttpStatusCode.OK, result);
                })
        );

        // --- DATA RETRIEVAL & PREVIEW (Queries) ---

        /**
         * GET /ai-assistance/history
         * Action: Fetches previous AI suggestions (Raw DB models).
         */
        aiRoutes.get(
                '/history',
                authorizeRole(['USER', 'ADMIN']),
                protectHandler(async (req: Request, res: Response) => {
                        const userId = (req as any).user.id;
                        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

                        const history = await usecaseHttp.getLatestAiSuggestions.execute(userId, limit);

                        return HttpHelpers.sendResponse(res, HttpStatusCode.OK, history);
                })
        );

        /**
         * POST /ai-assistance/preview
         * Action: Returns a "What-if" tailoring result without saving to DB.
         */
        aiRoutes.post(
                '/preview',
                authorizeRole(['USER', 'ADMIN']),
                protectHandler(async (req: Request, res: Response) => {
                        const { resumeSnapshot, jobDescription } = req.body;

                        const preview = await usecaseHttp.previewTailoredResume.execute({
                                resumeSnapshot,
                                jobDescription
                        });

                        return HttpHelpers.sendResponse(res, HttpStatusCode.OK, preview);
                })
        );

        return aiRoutes;
}
