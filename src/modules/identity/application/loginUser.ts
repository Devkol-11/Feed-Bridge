import type { RefreshToken, IdentityUser } from 'generated/prisma/client.js';
import { ApplicationError } from '@src/shared/base/errorBase.js';
import { IdentityService } from '../service/identityService.js';
import { LoginRequestDto, LoginResponseDto } from '../dtos/identityDto.js';
import { IdentityRepository } from '../Repository/identityRepo.js';
import { RefreshTokenRepository } from '../Repository/refreshTokenRepo.js';
import { HttpStatusCode } from '@src/shared/http/httpStatusCodes.js';
import { dbTransaction } from '@src/shared/helpers/dbTransaction.js';
import { JWT_CLAIMS } from '../dtos/types.js';

export class LoginUser {
        private readonly identityRepo = new IdentityRepository();
        private readonly refreshTokenRepo = new RefreshTokenRepository();
        private readonly identityService = new IdentityService();

        async execute(data: LoginRequestDto): Promise<LoginResponseDto> {
                const { email, password } = data;

                const user: IdentityUser | null = await this.identityRepo.findByEmail(email);

                if (!user) {
                        throw new ApplicationError('Invalid Credentials', HttpStatusCode.BAD_REQUEST);
                }

                const isPasswordValid = await this.identityService.decryptPassword({
                        plainPassword: password,
                        encryptedPassword: user.passwordHash
                });

                if (!isPasswordValid) {
                        throw new ApplicationError('Invalid Password', HttpStatusCode.BAD_REQUEST);
                }

                const { value, expiry } = this.identityService.generateRefreshTokenWithExpiry();

                const refreshToken: RefreshToken = {
                        id: crypto.randomUUID(),
                        identityUserId: user.id,
                        value,
                        expiresAt: expiry,
                        isRevoked: false,
                        createdAt: new Date(),
                        updatedAt: new Date()
                };

                await dbTransaction(async (trx) => {
                        await this.identityRepo.save(user, trx);
                        await this.refreshTokenRepo.save(refreshToken, trx);
                });

                const claims: JWT_CLAIMS = {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        role: user.role
                };
                const accessToken = this.identityService.generateAccessToken(claims);

                return {
                        message: 'Login successful',
                        data: {
                                id: user.id,
                                email: user.email,
                                firstName: user.firstName,
                                lastName: user.lastName
                        },
                        tokens: {
                                accessToken,
                                refreshToken: value
                        }
                };
        }
}
