import { UserPreferenceRepositoryPort } from '@src/bounded-contexts/userPreferences/domain/repository/userPreferenceRepository.js';
import { ToggleAlertsCommand } from './toogleAlertsCommand.js';
import { UserPreferenceDomainExceptions } from '@src/bounded-contexts/userPreferences/domain/exceptions/domainExceptions.js';

export class ToggleAlerts {
        constructor(private readonly repo: UserPreferenceRepositoryPort) {}

        async execute(command: ToggleAlertsCommand): Promise<void> {
                const profile = await this.repo.findByUserId(command.userId);

                if (!profile) throw new UserPreferenceDomainExceptions.PreferenceNotFound();

                profile.toggleAlerts(command.isEnabled);

                await this.repo.save(profile);
        }
}
