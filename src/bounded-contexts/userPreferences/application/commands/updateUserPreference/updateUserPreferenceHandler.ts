import { UpdateUserPreferenceCommand } from './updateUserPreferenceCommand.js';
import { UserPreferenceRepositoryPort } from '@src/bounded-contexts/userPreferences/domain/repository/userPreferenceRepository.js';
import { UserPreferenceDomainExceptions } from '@src/bounded-contexts/userPreferences/domain/exceptions/domainExceptions.js';

export class UpdateUserPreference {
        constructor(private readonly repo: UserPreferenceRepositoryPort) {}

        async execute(command: UpdateUserPreferenceCommand): Promise<void> {
                const profile = await this.repo.findByUserId(command.userId);

                if (!profile) {
                        throw new UserPreferenceDomainExceptions.PreferenceNotFound();
                }

                profile.updateFilters(command.categories, command.locations, command.minimumSalary);

                await this.repo.save(profile);
        }
}
