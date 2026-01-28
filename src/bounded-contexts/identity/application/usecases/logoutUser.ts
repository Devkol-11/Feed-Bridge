import { DomainErrors } from '../../domain/exceptions/domainErrors.js';
import { IdentityRepositoryPort } from '../ports/identityRepositoryPort.js';
import { RefreshTokenRepositoryPort } from '../ports/refreshRepositoryTokenPort.js';
import { TransactionScriptPort } from '../ports/transactionManagerPort.js';

interface LogoutRequestDto {
        userId: string;
        refreshToken: string;
}

export class LogoutUser {
        constructor(
                private readonly identityRepository: IdentityRepositoryPort,
                private readonly refreshTokenRepository: RefreshTokenRepositoryPort,
                private readonly unitOfWork: TransactionScriptPort
        ) {}

        async execute(data: LogoutRequestDto): Promise<{ message: string }> {
                const { userId, refreshToken } = data;

                const user = await this.identityRepository.findById(userId);

                if (!user) {
                        throw new DomainErrors.UserNotFoundError();
                }

                const token = await this.refreshTokenRepository.findByValue(refreshToken);

                if (!token) throw new DomainErrors.InvalidRefreshTokenError();

                token.revoke();

                await this.unitOfWork.run(async (trx) => {
                        await this.refreshTokenRepository.save(token, trx);
                        await this.identityRepository.save(user, trx);
                });

                return {
                        message: 'Logged out successfully'
                };
        }
}
