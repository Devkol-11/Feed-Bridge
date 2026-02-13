import type { UserPreference } from 'generated/prisma/client.js';
import { CreateUserPreferenceRequest } from '../dtos/userPreferenceDtos/userPreferenceDtos.js';
import { UserPreferenceRepository } from '../Repository/UserPreferenceRepository.js';

export class CreateUserPreference {
     private repo = new UserPreferenceRepository()

        async execute(command: CreateUserPreferenceRequest): Promise<void> {

                const userPreference : UserPreference = {
                        id: crypto.randomUUID(),
                        userId: command.userId,
                        categories: command.categories ?? [],
                        locations: command.locations ?? [],
                        minimumSalary: command.minimumSalary,
                        isAlertsEnabled: command.isAlertsEnabled,
                        createdAt : new Date(),
                        updatedAt : new Date()
                }

                await this.repo.save(userPreference);
        }
}
