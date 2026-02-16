import { FindJobs } from './application/findJobs.js';
import { GetAllJobs } from './application/getAllJobs.js';

export const jobCatalog_usecase_http = {
        findJobs: new FindJobs(),
        getAllJobs: new GetAllJobs()
};
