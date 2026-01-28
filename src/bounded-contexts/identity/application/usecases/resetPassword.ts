import { DomainErrors } from '../../domain/exceptions/domainErrors.js';
import { DomainService } from '../../domain/service/domainService.js';
import { ResetTokenRepositoryPort } from '../ports/resetTokenRepositoryPort.js';
import { IdentityRepositoryPort } from '../ports/identityRepositoryPort.js';
import { ResetPasswordRequestDto } from '../dtos/domainDto.js';
import { TransactionScriptPort } from '../ports/transactionManagerPort.js';

export class ResetPassword {
        constructor(
                private readonly identityRepository: IdentityRepositoryPort,
                private readonly resetTokenReposiotry: ResetTokenRepositoryPort,
                private readonly unitOfWork: TransactionScriptPort,
                private readonly domainService: DomainService
        ) {}

        async execute(data: ResetPasswordRequestDto): Promise<{ message: string }> {
                const { incomingToken, newPassword } = data;

                const resetToken = await this.resetTokenReposiotry.findByValue(incomingToken);

                if (!resetToken) return new DomainErrors.InvalidResetTokenError('Invalid reset token');

                resetToken.ensureIsActive();

                const user = await this.identityRepository.findById(resetToken.props.identityUserId);

                if (!user) throw new DomainErrors.InvalidResetTokenError('No user found for this token');

                const newPasswordHash = await this.domainService.encryptPassword(newPassword);

                user.resetPassword(newPasswordHash);

                resetToken.invalidate();

                await this.unitOfWork.run(async (trx) => {
                        await this.resetTokenReposiotry.save(resetToken, trx);
                        await this.identityRepository.save(user, trx);
                });

                return { message: 'Password has been reset successfully.' };
        }
}
