import { Router } from 'express';
import { jobCatalog_usecase_http } from '../../jobFeedIngestion.module.js';
import { authorizeRole } from '@src/shared/middleware/authorizeRole.js';
import { protectHandler } from '@src/shared/helpers/catchAsync.js';
import { HttpHelpers } from '@src/shared/http/httpHelpers.js';
import { HttpStatusCode } from '@src/shared/http/httpStatusCodes.js';

export function JobFeedIngestionRoutes(): Router {
        const jobFeedRoutes = Router();

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

                        const jobs = await jobCatalog_usecase_http.findJobs.execute(query);

                        return HttpHelpers.sendResponse(res, HttpStatusCode.OK, {
                                message: 'Jobs Fetched Successfully',
                                jobs: jobs
                        });
                })
        );

        jobFeedRoutes.get(
                '/jobs',
                authorizeRole('USER'),
                protectHandler(async (req, res) => {})
        );

        return jobFeedRoutes;
}
