import { ApplicationError } from '@src/shared/base/errorBase.js';
import { RefreshToken } from 'generated/prisma/client.js';
import { IdentityService } from '../service/identityService.js';
import { IdentityRepository } from '../Repository/identityRepo.js';
import { RefreshTokenRepository } from '../Repository/refreshTokenRepo.js';
import { HttpStatusCode } from '@src/shared/http/httpStatusCodes.js';
import { JWT_CLAIMS } from '../dtos/types.js';
import { randomUUID } from 'node:crypto';
import { dbTransaction } from '@src/shared/helpers/dbTransaction.js';

export class TokenRefresh {
        private identityRepo = new IdentityRepository();
        private refreshTokenRepo = new RefreshTokenRepository();
        private identityService = new IdentityService();

        async execute(refreshTokenValue: string) {
                // Find the token
                const token = await this.refreshTokenRepo.findByValue(refreshTokenValue);

                if (!token) {
                        throw new ApplicationError('Invalid RefreshToken', HttpStatusCode.BAD_REQUEST);
                }

                // REUSE DETECTION: If token was already revoked, someone is cheating.
                if (token.isRevoked) {
                        await this.refreshTokenRepo.deleteAllForUser(token.identityUserId);
                        throw new ApplicationError(
                                'Token reuse detected. All sessions invalidated.',
                                HttpStatusCode.BAD_REQUEST
                        );
                }

                // Find User (ID should come from the token object, not user input)
                const user = await this.identityRepo.findById(token.identityUserId);
                if (!user) throw new ApplicationError('User not found', HttpStatusCode.BAD_REQUEST);

                // Perform Rotation
                token.isRevoked = true;
                const { value, expiry } = this.identityService.generateRefreshTokenWithExpiry();

                const claims: JWT_CLAIMS = {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        role: user.role
                };
                const accessToken = this.identityService.generateAccessToken(claims);

                const newRefreshToken: RefreshToken = {
                        id: randomUUID(),
                        identityUserId: user.id,
                        expiresAt: expiry,
                        value,
                        isRevoked: false,
                        createdAt: new Date(),
                        updatedAt: new Date()
                };

                await dbTransaction(async (trx) => {
                        await this.refreshTokenRepo.save(newRefreshToken, trx); // save new
                        await this.refreshTokenRepo.delete(token.id, trx); // delete old
                });

                return { accessToken, refreshToken: newRefreshToken.value };
        }
}
