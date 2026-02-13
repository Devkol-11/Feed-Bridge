import { IdentityService } from '../service/identityService.js';
import type { ResetToken } from 'generated/prisma/client.js';
import { IdentityRepository } from '../Repository/identityRepo.js';
import { ResetTokenRepository } from '../Repository/resetTokenRepo.js';
import { IdentityEvents } from '../helpers/events/identityEvents.js';
import { randomUUID } from 'node:crypto';

export class ForgotPassword {
        private identityRepo: IdentityRepository = new IdentityRepository();
        private identityService: IdentityService = new IdentityService();
        private resetTokenRepo: ResetTokenRepository = new ResetTokenRepository();

        async execute(email: string): Promise<{ message: string }> {
                const user = await this.identityRepo.findByEmail(email);

                // Even if user doesn't exist, we return a success message to prevent "Email Enumeration" attacks.
                if (!user) return { message: 'If an account exists, a reset link has been sent.' };

                // Ensuring only one active token at a time
                const existingToken = await this.resetTokenRepo.findActiveByUserId(user.id);

                if (existingToken) {
                        existingToken.isExpired = true;
                        existingToken.isValid = false;
                        await this.resetTokenRepo.delete(existingToken.id);
                }

                const { value, expiry } = this.identityService.generateResetToken();

                const resetToken: ResetToken = {
                        id: randomUUID(),
                        identityUserId: user.id,
                        value,
                        isExpired: false,
                        isValid: true,
                        expiresAt: expiry,
                        createdAt: new Date(),
                        updatedAt: new Date()
                };

                await this.resetTokenRepo.save(resetToken);

                // Emit event for sending email (handled by a separate listener)
                // Push the event / Job to the Email Notification Queue.

                return { message: 'If an account exists, a reset link has been sent.' };
        }
}
