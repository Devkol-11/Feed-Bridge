import { UserPreferenceRepository } from '../Repository/UserPreferenceRepository.js';

export class GetMatchingJobsCount {
        private repo = new UserPreferenceRepository();

        async execute(query: { userId: string }): Promise<number> {
                const prefs = await this.repo.fetchPreferenceById(query.userId);
                if (!prefs) return 0;

                return await this.repo.countJobsByCriteria({
                        categories: prefs.categories,
                        locations: prefs.locations
                });
        }
}
