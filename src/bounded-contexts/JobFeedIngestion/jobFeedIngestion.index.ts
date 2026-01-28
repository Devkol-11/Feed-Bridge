import { GetJobs } from './application/usecases/getJobs.js';
import { IngestJobs } from './application/usecases/ingestJobs.js';
import { RegisterJobs } from './application/usecases/registerJobs.js';
import { ToogleSourceState } from './application/usecases/toogleSourceState.js';
import { PrismaJobListingRepository } from './infrastructure/adapters/persistence/jobListingRepo.js';
import { PrismaJobSourceRepository } from './infrastructure/adapters/persistence/jobSourceRepo.js';
import { RemotiveJsonAdapter } from './infrastructure/adapters/external-apis/remotive-json-jobAdapter.js';

const prismaJobListingRepository = new PrismaJobListingRepository();
const prismaJobSourceRepository = new PrismaJobSourceRepository();
const remotiveJsonAdapter = new RemotiveJsonAdapter();
const getJobs = new GetJobs(prismaJobListingRepository);
const ingestJobs = new IngestJobs(prismaJobSourceRepository, prismaJobListingRepository);
const registerJobs = new RegisterJobs(prismaJobSourceRepository);
const toogleJobSourceState = new ToogleSourceState(prismaJobSourceRepository);

export const usecaseHttp = {
        getJobs: getJobs,
        registerJobs: registerJobs,
        toogleJobSourceState: toogleJobSourceState
};

export const useCaseCron = {
        ingestJobs: ingestJobs
};
