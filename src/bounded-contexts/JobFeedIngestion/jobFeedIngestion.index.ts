import { GetAllJobs } from './application/queries/getAllJobs/getAllJobsHandler.js';
import { IngestJobSources } from './application/commands/ingestJobSource/injestJobSourceHandler.js';
import { RegisterJobSources } from './application/commands/registerJobSource/registerJobsSourceHandler.js';
import { ToogleSourceState } from './application/commands/toogleJobSourceState/toogleSourceStateHandler.js';
import { PrismaJobListingRepository } from './infrastructure/adapters/persistence/prisma/writes/jobListingRepo.js';
import { PrismaJobSourceRepository } from './infrastructure/adapters/persistence/prisma/writes/jobSourceRepo.js';
import { RemotiveJsonAdapter } from './infrastructure/adapters/external-apis/remotive-json-jobAdapter.js';

const prismaJobListingRepository = new PrismaJobListingRepository();
const prismaJobSourceRepository = new PrismaJobSourceRepository();
const getAllJobs = new GetAllJobs(prismaJobListingRepository);
const ingestJobs = new IngestJobSources(prismaJobSourceRepository, prismaJobListingRepository);
const registerJobs = new RegisterJobSources(prismaJobSourceRepository);
const toogleJobSourceState = new ToogleSourceState(prismaJobSourceRepository);

export const usecaseHttp = {
        getAllJobs: getAllJobs,
        registerJobs: registerJobs,
        toogleJobSourceState: toogleJobSourceState
};

export const useCaseCron = {
        ingestJobs: ingestJobs
};
