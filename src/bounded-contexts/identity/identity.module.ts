import { RegisterUser } from './application/usecases/registerUser.js';
import { LoginUser } from './application/usecases/loginUser.js';
import { LogoutUser } from './application/usecases/logoutUser.js';
import { ResetPassword } from './application/usecases/resetPassword.js';
import { ForgotPassword } from './application/usecases/forgotPassword.js';
import { IdentityRepository } from './infrastructure/adapters/perisitence/identityRepo.js';
import { ResetTokenRepository } from './infrastructure/adapters/perisitence/resetTokenRepo.js';
import { RefreshTokenRepository } from './infrastructure/adapters/perisitence/refreshTokenRepo.js';
import { DomainService } from './domain/service/domainService.js';
import { RedisIdentityCache } from './infrastructure/adapters/external/identityCache.js';
import { BullMQ_Identity_EventBus } from './infrastructure/adapters/external/identityEventBus.js';
import { redisCache } from '@src/config/redis/cache/cache.js';
import { PrismaTransactionManager } from './infrastructure/adapters/external/prismaTransactionManager.js';

const redisIdentityCache = new RedisIdentityCache(redisCache);

const identityRepository = new IdentityRepository(redisIdentityCache);

const resetTokenReposiotry = new ResetTokenRepository();

const refreshTokenRepository = new RefreshTokenRepository();

const domainService = new DomainService();

const bull_mq_identity_eventBus = new BullMQ_Identity_EventBus();

const prismaTransactionManager = new PrismaTransactionManager();

export const usecase = {
        register: new RegisterUser(
                identityRepository,
                refreshTokenRepository,
                domainService,
                prismaTransactionManager,
                bull_mq_identity_eventBus
        ),
        login: new LoginUser(
                identityRepository,
                refreshTokenRepository,
                prismaTransactionManager,
                domainService
        ),
        logout: new LogoutUser(identityRepository, refreshTokenRepository, prismaTransactionManager),
        forgotPassword: new ForgotPassword(
                identityRepository,
                resetTokenReposiotry,
                domainService,
                bull_mq_identity_eventBus
        ),
        resetPassword: new ResetPassword(
                identityRepository,
                resetTokenReposiotry,
                prismaTransactionManager,
                domainService
        )
};
