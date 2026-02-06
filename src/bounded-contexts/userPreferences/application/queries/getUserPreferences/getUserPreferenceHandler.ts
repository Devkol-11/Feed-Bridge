import { GetUserPreferenceQuery } from './getUserPreferenceQuery.js';
import { GetUserPreferenceRepoPort, UserPreferenceReadModel } from './getUserPreferenceRepoPort.js';

export class GetUserPreference {
        constructor(private readonly repo: GetUserPreferenceRepoPort) {}

        async execute(query: GetUserPreferenceQuery): Promise<UserPreferenceReadModel> {
                const preferences = await this.repo.fetchByUserId(query.userId);
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
