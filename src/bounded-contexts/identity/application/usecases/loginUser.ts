import { RefreshToken } from '../../domain/aggregates/refreshToken.js';
import { DomainErrors } from '../../domain/errors/domainErrors.js';
import { DomainService } from '../../domain/service/domainService.js';
import { IdentityRepositoryPort } from '../../infrastructure/ports/identityRepositoryPort.js';
import { RefreshTokenRepositoryPort } from '../../infrastructure/ports/refreshRepositoryTokenPort.js';
import { TransactionScriptPort } from '../../infrastructure/ports/transactionManagerPort.js';
import { LoginRequestDto, LoginResponseDto } from '../dtos/domainDto.js';

export class LoginUser {
        constructor(
                private readonly identityRepository: IdentityRepositoryPort,
                private readonly refreshTokenRepository: RefreshTokenRepositoryPort,
                private readonly unitOfWork: TransactionScriptPort,
                private readonly domainService: DomainService
        ) {}

        async execute(data: LoginRequestDto): Promise<LoginResponseDto> {
                const { email, password } = data;

                const identityUser = await this.identityRepository.findByEmail(email);

                if (!identityUser) {
                        throw new DomainErrors.InvalidCredentialsError();
                }

                const isPasswordValid = await this.domainService.decryptPassword({
                        plainPassword: password,
                        encryptedPassword: identityUser.props.passwordHash
                });

                if (!isPasswordValid) {
                        throw new DomainErrors.InvalidCredentialsError();
                }

                const { value, expiry } = this.domainService.generateRefreshTokenWithExpiry();

                const refreshToken = RefreshToken.create({
                        value,
                        identityUserId: identityUser.id,
                        expiresAt: expiry
                });

                await this.unitOfWork.run(async (trx) => {
                        await this.identityRepository.save(identityUser, trx);
                        await this.refreshTokenRepository.save(refreshToken, trx);
                });

                const claims = identityUser.getClaims();
                const accessToken = this.domainService.generateAccessToken(claims);

                // 7. Dispatch Domain Events (e.g., UserLoggedInEvent)
                // const events = identityUser.pullDomainEvents();
                // await this.eventDispatcher.dispatch(events);

                return {
                        message: 'Login successful',
                        data: {
                                id: identityUser.id,
                                email: identityUser.props.email,
                                firstName: identityUser.props.firstName,
                                lastName: identityUser.props.lastName
                        },
                        tokens: {
                                accessToken,
                                refreshToken: value
                        }
                };
        }
}
