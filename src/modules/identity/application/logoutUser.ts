import { ApplicationError } from '@src/shared/base/errorBase.js';
import { IdentityRepository } from '../Repository/identityRepo.js';
import { RefreshTokenRepository } from '../Repository/refreshTokenRepo.js';
import { LogoutRequestDto } from '../dtos/identityDto.js';
import { HttpStatusCode } from '@src/shared/http/httpStatusCodes.js';

export class LogoutUser {
        private readonly identityRepo = new IdentityRepository();
        private readonly refreshTokenRepo = new RefreshTokenRepository();

        async execute(data: LogoutRequestDto): Promise<{ message: string }> {
                const { userId, refreshToken } = data;

                const user = await this.identityRepo.findById(userId);

                if (!user) {
                        throw new ApplicationError('User not found', HttpStatusCode.BAD_REQUEST);
                }

                const token = await this.refreshTokenRepo.findByValue(refreshToken);

                if (!token) throw new ApplicationError('Invalid refresh token', HttpStatusCode.BAD_REQUEST);

                token.isRevoked = true;
                token.updatedAt = new Date();

                await this.refreshTokenRepo.save(token);

                return {
                        message: 'Logged out successfully'
                };
        }
}
