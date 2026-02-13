import { HttpStatusCode } from '@src/shared/http/httpStatusCodes.js';
import { UserPreferenceRepository } from '../Repository/UserPreferenceRepository.js';
import { ToggleAlertsRequest } from '../dtos/userPreferenceDtos/userPreferenceDtos.js';
import { ApplicationError } from '@src/shared/base/errorBase.js';

export class ToggleAlerts {
        private repo = new UserPreferenceRepository();

        async execute(command: ToggleAlertsRequest): Promise<void> {
                const profile = await this.repo.findByUserId(command.userId);

                if (!profile)
                        throw new ApplicationError('User preference not found', HttpStatusCode.BAD_REQUEST);

                // Rule: Can't enable alerts if they have no categories or locations
                if (command.isEnabled && profile.categories.length === 0 && profile.locations.length === 0) {
                        throw new ApplicationError(
                                'Cannot enable alerts with no search criteria.',
                                HttpStatusCode.BAD_REQUEST
                        );
                }
                profile.isAlertsEnabled = command.isEnabled;

                await this.repo.save(profile);
        }
}
