import type { IdentityUser } from 'generated/prisma/client.js';
import type { RefreshToken } from 'generated/prisma/client.js';
import { IdentityUserRole, IdentityStatus } from 'generated/prisma/client.js';
import { ApplicationError } from '@src/shared/base/errorBase.js';
import { RegisterRequestDto, RegisterResponseDto } from '../dtos/identityDto.js';
import { IdentityRepository } from '../Repository/identityRepo.js';
import { RefreshTokenRepository } from '../Repository/refreshTokenRepo.js';
import { IdentityService } from '../service/identityService.js';
import { HttpStatusCode } from '@src/shared/http/httpStatusCodes.js';
import { randomUUID } from 'node:crypto';
import { JWT_CLAIMS } from '../dtos/types.js';
import { dbTransaction } from '@src/shared/helpers/dbTransaction.js';
import { IdentityEvents } from '../helpers/events/identityEvents.js';

export class RegisterUser {
        private identityRepo = new IdentityRepository();
        private refreshTokenRepo = new RefreshTokenRepository();
        private identityService = new IdentityService();

        async execute(data: RegisterRequestDto): Promise<RegisterResponseDto> {
                const { email, password, firstName, lastName } = data;

                const userExists = await this.identityRepo.existsByEmail(email);

                if (userExists) throw new ApplicationError('User already exists', HttpStatusCode.CONFLICT);

                const passwordHash = await this.identityService.encryptPassword(password);

                const newUser: IdentityUser = {
                        id: randomUUID(),
                        firstName,
                        lastName,
                        email,
                        passwordHash,
                        role: IdentityUserRole.USER,
                        status: IdentityStatus.ACTIVE,
                        createdAt: new Date(),
                        updatedAt: new Date()
                };

                const { value, expiry } = this.identityService.generateRefreshTokenWithExpiry();

                const refreshToken: RefreshToken = {
                        id: randomUUID(),
                        identityUserId: newUser.id,
                        isRevoked: false,
                        value,
                        expiresAt: expiry,
                        createdAt: new Date(),
                        updatedAt: new Date()
                };

                await dbTransaction(async (trx) => {
                        await this.identityRepo.save(newUser, trx);
                        await this.refreshTokenRepo.save(refreshToken, trx);
                });

                const claims: JWT_CLAIMS = {
                        id: newUser.id,
                        firstName: newUser.firstName,
                        email: newUser.email,
                        role: newUser.role
                };

                const accessToken = this.identityService.generateAccessToken(claims);

                const userRegisteredEvent = new IdentityEvents.UserRegisteredEvent({
                        userId: newUser.id,
                        email: newUser.email
                });

                // push a 'USER REGISTERED EVENT' to the EMAIL_NOTIFICATION QUEUE

                return {
                        message: 'Regisration successful ',
                        data: {
                                email,
                                firstName,
                                lastName
                        },
                        tokens: {
                                accessToken,
                                refreshToken: value
                        }
                };
        }
}
