import { FindJobs } from './application/queries/findJobs/findJobsHandler.js';
import { GetAllJobs } from './application/queries/getAllJobs/getAllJobsHandler.js';
import { PrismaGetAllJobsRepo } from './infrastructure/adapters/persistence/prisma/reads/getAllJobsRepo.js';
import { IngestJobSources } from './application/commands/ingestJobSource/injestJobSourceHandler.js';
import { RegisterJobSources } from './application/commands/registerJobSource/registerJobsSourceHandler.js';
import { ToogleSourceState } from './application/commands/toogleJobSourceState/toogleSourceStateHandler.js';
import { PrismaJobListingRepository } from './infrastructure/adapters/persistence/prisma/writes/jobListingRepo.js';
import { PrismaJobSourceRepository } from './infrastructure/adapters/persistence/prisma/writes/jobSourceRepo.js';
import { PrismaFindJobsRepo } from './infrastructure/adapters/persistence/prisma/reads/findJobsRepo.js';

const findJobs = new FindJobs(new PrismaFindJobsRepo());
const getAllJobs = new GetAllJobs(new PrismaGetAllJobsRepo());
const ingestJobs = new IngestJobSources(new PrismaJobSourceRepository(), new PrismaJobListingRepository());
const registerJobs = new RegisterJobSources(new PrismaJobSourceRepository());
const toogleJobSourceState = new ToogleSourceState(new PrismaJobSourceRepository());

export const usecaseHttp = {
        findJobs,
        getAllJobs,
        registerJobs,
        toogleJobSourceState
};

export const useCaseCron = {
        ingestJobs: ingestJobs
};
