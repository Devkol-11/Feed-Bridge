import { ApplicationError } from '@src/shared/base/errorBase.js';
import { IdentityRepository } from '../Repository/identityRepo.js';
import { IdentityService } from '../service/identityService.js';
import { ResetTokenRepository } from '../Repository/resetTokenRepo.js';
import { ResetPasswordRequestDto } from '../dtos/identityDto.js';
import { HttpStatusCode } from '@src/shared/http/httpStatusCodes.js';
import {dbTransaction} from '@src/shared/helpers/dbTransaction.js';

export class ResetPassword {
        private identityRepo = new IdentityRepository();
        private resetTokenRepo = new ResetTokenRepository();
        private identityService = new IdentityService();

        async execute(data: ResetPasswordRequestDto): Promise<{ message: string }> {
                const { incomingToken, newPassword } = data;

                const resetToken = await this.resetTokenRepo.findByValue(incomingToken);

                if (!resetToken)
                        return new ApplicationError('Invalid reset token ', HttpStatusCode.BAD_REQUEST);

                if (!resetToken.isValid || resetToken.isExpired) {
                        throw new ApplicationError(
                                'This token has already been used',
                                HttpStatusCode.BAD_REQUEST
                        );
                }

                if (resetToken.expiresAt > new Date()) {
                        throw new ApplicationError('This token has expired', HttpStatusCode.BAD_REQUEST);
                }

                const user = await this.identityRepo.findById(resetToken.identityUserId);

                if (!user)
                        throw new ApplicationError(
                                'No user found for this token',
                                HttpStatusCode.BAD_REQUEST
                        );

                const newPasswordHash = await this.identityService.encryptPassword(newPassword);

                user.passwordHash = newPasswordHash;
                user.updatedAt = new Date();

                resetToken.isValid = false;
                resetToken.isExpired = true;

                await dbTransaction(async (trx) => {
                        await this.resetTokenRepo.save(resetToken, trx);
                        await this.identityRepo.save(user, trx);
                });

                return { message: 'Password has been reset successfully.' };
        }
}
