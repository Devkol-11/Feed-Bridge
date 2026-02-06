import { CreateUserPreference } from './application/commands/createUserPreference/createUserPreferenceHandler.js';
import { UpdateUserPreference } from './application/commands/updateUserPreference/updateUserPreferenceHandler.js';
import { ToggleAlerts } from './application/commands/toogleAlerts/toogleAlertsHandler.js';
import { GetUserPreference } from './application/queries/getUserPreferences/getUserPreferenceHandler.js';
import { GetMatchingJobsCount } from './application/queries/getMatchingJobsCount/getMatchingJobsHandler.js';
import { FindUsersMatchingJobHandler } from './application/queries/findUsersMatchingJob/findUsersMatchingJobHandler.js';
import { PrismaUserPreferenceRepo } from './infrastructure/adapters/persistence/writes/prismaUserPreferenceRepository.js';
import { PrismaGetUserPreferenceRepo } from './infrastructure/adapters/persistence/reads/prismaGetUserPreferenceRepo.js';
import { PrismaJobCatalogBridge } from './infrastructure/adapters/cross-context/userPreferenceJobCatalog.js';

//Commands
const createUserPreference = new CreateUserPreference(new PrismaUserPreferenceRepo());
const updateUserPreference = new UpdateUserPreference(new PrismaUserPreferenceRepo());
const toggleAlerts = new ToggleAlerts(new PrismaUserPreferenceRepo());
// Queries
const getUserPreference = new GetUserPreference(new PrismaGetUserPreferenceRepo());
const getMatchingJobsCount = new GetMatchingJobsCount(
        new PrismaGetUserPreferenceRepo(),
        new PrismaJobCatalogBridge()
);
const findUsersMatchingJob = new FindUsersMatchingJobHandler(new PrismaJobCatalogBridge());

export const usecaseHttp = {
        //commands
        createUserPreference,
        updateUserPreference,
        toggleAlerts,
        //queries
        getUserPreference,
        getMatchingJobsCount,
        findUsersMatchingJob
};
