import { UserPreferenceRepository } from '../Repository/UserPreferenceRepository.js';
import { FindUsersMatchingJobRequest } from '../dtos/userPreferenceDtos/userPreferenceDtos.js';

export class FindUsersMatchingJob {
        private repo = new UserPreferenceRepository();

        async execute(query: FindUsersMatchingJobRequest): Promise<string[]> {
                if (!query.category || !query.location) return [];

                return await this.repo.findUsersMatchingJob(query.category, query.location);
        }
}
