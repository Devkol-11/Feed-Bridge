import { Router } from 'express';
import { identityUsecase } from '@src/modules/identity/identity.module.js';
import * as schemas from '../middlewares/zod/schema.js';
import { validate } from '../middlewares/zod/validateSchema.js';
import { HttpHelpers } from '@src/shared/http/httpHelpers.js';
import { HttpStatusCode } from '@src/shared/http/httpStatusCodes.js';
import { protectHandler } from '@src/shared/helpers/catchAsync.js';
import {
        ForgotPasswordRequestDto,
        LoginRequestDto,
        RegisterRequestDto,
        ResetPasswordRequestDto
} from '@src/modules/identity/dtos/identityDto.js';

export function IdentityRoutes() {
        const identityRouter = Router();

        identityRouter.post(
                '/register',
                validate(schemas.RegisterSchema),
                protectHandler(async (req, res) => {
                        const { email, firstName, lastName, password } = req.body as RegisterRequestDto;

                        const response = await identityUsecase.register.execute({
                                email,
                                firstName,
                                lastName,
                                password
                        });

                        const { tokens, ...data } = response;

                        return HttpHelpers.sendResponse(res, HttpStatusCode.CREATED, data, tokens);
                })
        );

        identityRouter.post(
                '/login',
                validate(schemas.LoginSchema),
                protectHandler(async (req, res) => {
                        const { email, password } = req.body as LoginRequestDto;

                        const response = await identityUsecase.login.execute({ email, password });

                        return HttpHelpers.sendResponse(res, HttpStatusCode.OK, response);
                })
        );

        identityRouter.post(
                '/logout',
                protectHandler(async (req, res) => {
                        const refreshToken = req.cookies.refreshToken;

                        const response = await identityUsecase.logout.execute(refreshToken);

                        return HttpHelpers.sendResponse(res, HttpStatusCode.OK, response);
                })
        );

        identityRouter.post(
                '/forgot-password',
                validate(schemas.ForgotPasswordSchema),
                protectHandler(async (req, res) => {
                        const { email } = req.body as ForgotPasswordRequestDto;

                        const response = await identityUsecase.forgotPassword.execute(email);

                        return HttpHelpers.sendResponse(res, HttpStatusCode.OK, response);
                })
        );

        identityRouter.post(
                '/reset-password',
                validate(schemas.ResetPasswordSchema),
                protectHandler(async (req, res) => {
                        const { incomingToken, newPassword } = req.body as ResetPasswordRequestDto;

                        const response = await identityUsecase.resetPassword.execute({
                                incomingToken,
                                newPassword
                        });

                        return HttpHelpers.sendResponse(res, HttpStatusCode.CREATED, response);
                })
        );

        identityRouter.post(
                '/auth/refresh',
                protectHandler(async (req, res) => {
                        const refreshToken = req.cookies.refreshToken;

                        const response = await identityUsecase.tokenRefresh.execute(refreshToken);

                        return HttpHelpers.sendResponse(res, HttpStatusCode.OK, response);
                })
        );

        return identityRouter;
}
