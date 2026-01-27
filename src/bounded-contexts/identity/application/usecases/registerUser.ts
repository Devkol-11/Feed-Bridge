import { IdentityUser } from '../../domain/aggregates/identityUser.js';
import { RefreshToken } from '../../domain/aggregates/refreshToken.js';
import { DomainErrors } from '../../domain/errors/domainErrors.js';
import { DomainService } from '../../domain/service/domainService.js';
import { IdentityRepositoryPort } from '../../infrastructure/ports/identityRepositoryPort.js';
import { RefreshTokenRepositoryPort } from '../../infrastructure/ports/refreshRepositoryTokenPort.js';
import { IdentityEventBusPort } from '../../infrastructure/ports/identityEventBusPort.js';
import { RegisterRequestDto, RegisterResponseDto } from '../dtos/domainDto.js';
import { TransactionScriptPort } from '../../infrastructure/ports/transactionManagerPort.js';

export class RegisterUser {
        constructor(
                private readonly identityRepository: IdentityRepositoryPort,
                private readonly refreshTokenRepository: RefreshTokenRepositoryPort,
                private readonly domainService: DomainService,
                private readonly unitOfWork: TransactionScriptPort,
                private readonly eventDispatcher: IdentityEventBusPort
        ) {}

        async execute(data: RegisterRequestDto): Promise<RegisterResponseDto> {
                const { email, password, firstName, lastName } = data;

                const userExists = await this.identityRepository.existsByEmail(email);

                if (userExists) throw new DomainErrors.UserAlreadyExistsError();

                const passwordHash = await this.domainService.encryptPassword(password);

                const user = IdentityUser.create({
                        email,
                        firstName,
                        lastName,
                        passwordHash
                });

                const { value, expiry } = this.domainService.generateRefreshTokenWithExpiry();

                const refreshToken = RefreshToken.create({
                        value,
                        identityUserId: user.id,
                        expiresAt: expiry
                });

                await this.unitOfWork.run(async (trx) => {
                        await this.identityRepository.save(user, trx);
                        await this.refreshTokenRepository.save(refreshToken, trx);
                });

                const claim = user.getClaims();

                const accessToken = this.domainService.generateAccessToken(claim);

                const events = user.pullDomainEvents();

                for (const event of events) {
                        await this.eventDispatcher.publish(event);
                }

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
