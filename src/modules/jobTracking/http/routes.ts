import { Router, Request, Response } from 'express';
import { HttpStatusCode } from '@src/shared/http/httpStatusCodes.js';
import { HttpHelpers } from '@src/shared/http/httpHelpers.js';
import { jobTracking_usecase_http } from '../jobTracking,module.js';
import { protectHandler } from '@src/shared/helpers/catchAsync.js';
import { authorizeRole } from '@src/shared/middleware/authorizeRole.js';

export function JobTrackingRoutes(): Router {
        const jobTrackingRoutes = Router();

        // --- COMMANDS ---

        /**
         * POST /job-tracking/
         * TrackApplicationCommand: Initializes the relationship (Status: SAVED)
         */
        jobTrackingRoutes.post(
                '/job-tracking',
                authorizeRole(['USER', 'ADMIN']),
                protectHandler(async (req: Request, res: Response) => {
                        const userId = (req as any).user.id;
                        const { jobId } = req.body;

                        const applicationId = await jobTracking_usecase_http.trackApplication.execute({
                                userId,
                                jobId
                        });

                        return HttpHelpers.sendResponse(res, HttpStatusCode.CREATED, { applicationId });
                })
        );

        /**
         * PATCH /job-tracking/:applicationId/status
         * UpdateApplicationStatusCommand: Orchestrates the state transition
         */
        jobTrackingRoutes.patch(
                '/:applicationId/status',
                authorizeRole(['USER', 'ADMIN']),
                protectHandler(async (req: Request, res: Response) => {
                        const userId = (req as any).user.id;
                        const applicationId = req.params.applicationId as string;
                        const { status } = req.body;

                        await jobTracking_usecase_http.updateApplicationStatus.execute({
                                applicationId,
                                userId,
                                status
                        });

                        return HttpHelpers.sendResponse(res, HttpStatusCode.OK, {
                                message: 'Status updated successfully'
                        });
                })
        );

        /**
         * POST /job-tracking/:applicationId/notes
         * AddApplicationNoteCommand: Appends a new note
         */
        jobTrackingRoutes.post(
                '/:applicationId/notes',
                authorizeRole(['USER', 'ADMIN']),
                protectHandler(async (req: Request, res: Response) => {
                        const userId = (req as any).user.id;
                        const applicationId = req.params.applicationId as string;
                        const { content } = req.body;

                        await jobTracking_usecase_http.addApplicationNote.execute({
                                applicationId,
                                userId,
                                content
                        });

                        return HttpHelpers.sendResponse(res, HttpStatusCode.CREATED, {
                                message: 'Note added successfully'
                        });
                })
        );

        // --- QUERIES ---

        /**
         * GET /job-tracking/
         * GetUserApplications: Returns all tracked jobs for the user
         */
        jobTrackingRoutes.get(
                '/',
                authorizeRole(['USER', 'ADMIN']),
                protectHandler(async (req: Request, res: Response) => {
                        const userId = (req as any).user.id;
                        const applications = await jobTracking_usecase_http.getApplications.execute(userId);

                        return HttpHelpers.sendResponse(res, HttpStatusCode.OK, applications);
                })
        );

        /**
         * GET /job-tracking/:applicationId
         * GetApplicationDetails: Returns full detail + notes for specific app
         */
        jobTrackingRoutes.get(
                '/:applicationId',
                authorizeRole(['USER', 'ADMIN']),
                protectHandler(async (req: Request, res: Response) => {
                        const userId = (req as any).user.id;
                        const applicationId = req.params.applicationId as string;

                        const details = await jobTracking_usecase_http.getApplicationDetails.execute(
                                applicationId,
                                userId
                        );

                        return HttpHelpers.sendResponse(res, HttpStatusCode.OK, details);
                })
        );

        return jobTrackingRoutes;
}
