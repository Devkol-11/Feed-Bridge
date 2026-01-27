import { DomainErrors } from '../../domain/errors/domainErrors.js';
import { DomainService } from '../../domain/service/domainService.js';
import { IdentityRepositoryPort } from '../../infrastructure/ports/identityRepositoryPort.js';
import { ResetTokenRepositoryPort } from '../../infrastructure/ports/resetTokenRepositoryPort.js';
import { ResetToken } from '../../domain/aggregates/resetToken.js';
import { IdentityEventBusPort } from '../../infrastructure/ports/identityEventBusPort.js';
import { DomainEvents } from '../../domain/events/domainEvents.js';

export class ForgotPassword {
        constructor(
                private readonly identityRepository: IdentityRepositoryPort,
                private readonly resetTokenRepository: ResetTokenRepositoryPort,
                private readonly domainService: DomainService,
                private readonly eventBus: IdentityEventBusPort
        ) {}

        async execute(email: string): Promise<{ message: string }> {
                const user = await this.identityRepository.findByEmail(email);

                // Even if user doesn't exist, we return a success message to prevent "Email Enumeration" attacks.
                if (!user) return { message: 'If an account exists, a reset link has been sent.' };

                // Ensuring only one active token at a time
                const existingToken = await this.resetTokenRepository.findActiveByUserId(user.id);

                if (existingToken) {
                        existingToken.invalidate();
                }

                const { value, expiry } = this.domainService.generateResetToken();

                const resetToken = ResetToken.create({
                        value,
                        identityUserId: user.id,
                        expiresAt: expiry
                });

                await this.resetTokenRepository.save(resetToken);

                user.addSingleEvent(
                        new DomainEvents.UserForgotPasswordEvent({
                                userId: user.id,
                                email: user.props.email,
                                token: resetToken.props.value
                        })
                );

                const events = user.pullDomainEvents();

                for (const event of events) {
                        await this.eventBus.publish(event);
                }

                return { message: 'If an account exists, a reset link has been sent.' };
        }
}
