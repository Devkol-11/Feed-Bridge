import { GetUserPreferenceRequest } from '../dtos/userPreferenceDtos/userPreferenceDtos.js';
import { UserPreferenceRepository } from '../Repository/UserPreferenceRepository.js';

export class GetUserPreference {
        private repo = new UserPreferenceRepository();

        async execute(query: GetUserPreferenceRequest) {
                const preferences = await this.repo.fetchPreferenceById(query.userId);
                if (!preferences) {
                        return {
                                userId: query.userId,
                                categories: [],
                                locations: [],
                                minimumSalary: 0,
                                isAlertsEnabled: false
                        };
                }

                return preferences;
        }
}
