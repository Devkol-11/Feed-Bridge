import { Router } from 'express';
import { usecaseHttp } from '@src/bounded-contexts/JobFeedIngestion/jobFeedIngestion.index.js';
import { authorizeAdmin } from '../middle-wares/authorizeAdmin.js';
import { protectHandler } from '@src/shared/helpers/catchAsync.js';
import { HttpHelpers } from '@src/shared/http/httpHelpers.js';
import { HttpStatusCode } from '@src/shared/http/httpStatusCodes.js';
import { RegisterJobSourceDTO } from '@src/bounded-contexts/JobFeedIngestion/application/dtos/useCaseDTO.js';

export function JobFeedIngestionRoutes(): Router {
        const jobFeedRoutes = Router();

        // ✅ Create Job Source
        jobFeedRoutes.post(
                '/job-sources',
                authorizeAdmin('ADMIN'),
                protectHandler(async (req, res) => {
                        const data = req.body as RegisterJobSourceDTO;

                        const response = await usecaseHttp.registerJobs.execute(data);

                        HttpHelpers.sendResponse(res, HttpStatusCode.CREATED, response);
                })
        );

        // ✅ Toggle Source: Disable
        jobFeedRoutes.patch(
                '/job-sources/:id/disable',
                authorizeAdmin('ADMIN'),
                protectHandler(async (req, res) => {
                        await usecaseHttp.toogleJobSourceState.execute({
                                sourceId: req.params.id as string,
                                isEnabled: false
                        });

                        HttpHelpers.sendResponse(res, HttpStatusCode.OK, { message: 'Source disabled' });
                })
        );

        // ✅ Toggle Source: Enable
        jobFeedRoutes.patch(
                '/job-sources/:id/enable',
                authorizeAdmin('ADMIN'),
                protectHandler(async (req, res) => {
                        await usecaseHttp.toogleJobSourceState.execute({
                                sourceId: req.params.id as string,
                                isEnabled: true
                        });
                        HttpHelpers.sendResponse(res, HttpStatusCode.OK, { message: 'Source enabled' });
                })
        );

        // ✅ Get Jobs (Paginated)
        jobFeedRoutes.get(
                '/jobs',
                authorizeAdmin('ADMIN'),
                protectHandler(async (req, res) => {
                        const query = {
                                page: req.query.page ? Number(req.query.page) : 1,
                                pageSize: req.query.pageSize ? Number(req.query.pageSize) : 20,
                                sourceId: req.query.sourceId as string
                        };

                        const jobs = await usecaseHttp.getJobs.execute(query);

                        HttpHelpers.sendResponse(res, HttpStatusCode.OK, jobs);
                })
        );

        return jobFeedRoutes;
}
