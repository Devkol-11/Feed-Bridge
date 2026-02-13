import { CreateUserPreference } from './application/createUserPreference.js';
import { UpdateUserPreference } from './application/updateUserPreference.js';
import { ToggleAlerts } from './application/toogleAlerts.js';
import { GetUserPreference } from './application/getUserPreference.js';
import { FindUsersMatchingJob } from './application/findUsersMatchingJob.js';
import { GetMatchingJobsCount } from './application/getMatchingJobs.js';

const createUserPreference = new CreateUserPreference();
const updateUserPreference = new UpdateUserPreference();
const toggleAlerts = new ToggleAlerts();
const getUserPreference = new GetUserPreference();
const getMatchingJobsCount = new GetMatchingJobsCount();
const findUsersMatchingJob = new FindUsersMatchingJob();

export const UserPreference_usecase_Http = {
        createUserPreference,
        updateUserPreference,
        toggleAlerts,
        getUserPreference,
        getMatchingJobsCount,
        findUsersMatchingJob
};
