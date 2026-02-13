import { HttpStatusCode } from '@src/shared/http/httpStatusCodes.js';
import { UpdateUserPreferenceRequest } from '../dtos/userPreferenceDtos/userPreferenceDtos.js';
import { UserPreferenceRepository } from '../Repository/UserPreferenceRepository.js';
import { ApplicationError } from '@src/shared/base/errorBase.js';

export class UpdateUserPreference {
        private repo = new UserPreferenceRepository();

        async execute(command: UpdateUserPreferenceRequest): Promise<void> {
                const profile = await this.repo.findByUserId(command.userId);

                if (!profile) {
                        throw new ApplicationError('User preference not found', HttpStatusCode.BAD_REQUEST);
                }

                //Rule : Can't have more than 10 categories filter
                if (command.categories.length > 10) {
                        throw new ApplicationError(
                                'You cannot follow more than 10 categories.',
                                HttpStatusCode.BAD_REQUEST
                        );
                }

                if (command.minimumSalary < 0) {
                        throw new ApplicationError(
                                'Minimum salary cannot be negative.',
                                HttpStatusCode.BAD_REQUEST
                        );
                }

                profile.categories = command.categories;
                profile.locations = command.locations;
                profile.minimumSalary = command.minimumSalary;

                await this.repo.save(profile);
        }
}
