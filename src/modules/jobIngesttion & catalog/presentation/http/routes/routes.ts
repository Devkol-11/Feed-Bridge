import { Router } from 'express';
import { usecaseHttp } from '@src/modules/jobIngesttion & catalog/jobFeedIngestion.module.js';
import { authorizeRole } from '@src/shared/middleware/authorizeRole.js';
import { protectHandler } from '@src/shared/helpers/catchAsync.js';
import { HttpHelpers } from '@src/shared/http/httpHelpers.js';
import { HttpStatusCode } from '@src/shared/http/httpStatusCodes.js';
import { RegisterJobSourceCommand } from '@src/modules/jobIngesttion & catalog/application/commands/registerJobSource/registerJobSourceCommand.js';
export function JobFeedIngestionRoutes(): Router {
        const jobFeedRoutes = Router();

        // ✅ Create Job Source
        jobFeedRoutes.post(
                '/job-sources',
                authorizeRole('ADMIN'),
                protectHandler(async (req, res) => {
                        const data = req.body as RegisterJobSourceCommand;

                        const response = await usecaseHttp.registerJobs.execute(data);

                        HttpHelpers.sendResponse(res, HttpStatusCode.CREATED, response);
                })
        );

        // ✅ Toggle Source: Disable
        jobFeedRoutes.patch(
                '/job-sources/:id/disable',
                authorizeRole('ADMIN'),
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
                authorizeRole('ADMIN'),
                protectHandler(async (req, res) => {
                        await usecaseHttp.toogleJobSourceState.execute({
                                sourceId: req.params.id as string,
                                isEnabled: true
                        });
                        HttpHelpers.sendResponse(res, HttpStatusCode.OK, { message: 'Source enabled' });
                })
        );

        // ------- USER FACING ROUTES------

        // ✅ Get Jobs (Paginated)
        jobFeedRoutes.get(
                '/jobs',
                authorizeRole('USER'),
                protectHandler(async (req, res) => {
                        const rawCategory = req.query.category as string | undefined;
                        const rawLocation = req.query.location as string | undefined;
                        const rawSalary = req.query.salary as string | undefined;
                        const rawPage = req.query.page as string | undefined;

                        const parsedPage = rawPage ? parseInt(rawPage, 10) : 1;

                        const query = {
                                category: rawCategory,
                                location: rawLocation,
                                salary: rawSalary,
                                page: isNaN(parsedPage) ? 1 : parsedPage
                        };

                        const jobs = await usecaseHttp.findJobs.execute(query);

                        return HttpHelpers.sendResponse(res, HttpStatusCode.OK, {
                                message: 'Jobs Fetched Successfully',
                                jobs: jobs
                        });
                })
        );

        jobFeedRoutes.get('/jobs');

        return jobFeedRoutes;
}
