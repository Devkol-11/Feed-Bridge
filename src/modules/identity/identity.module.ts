import { RegisterUser } from './application/registerUser.js';
import { LoginUser } from './application/loginUser.js';
import { LogoutUser } from './application/logoutUser.js';
import { ResetPassword } from './application/resetPassword.js';
import { ForgotPassword } from './application/forgotPassword.js';
import { TokenRefresh } from './application/tokenRefresh.js';

export const identityUsecase = {
        register: new RegisterUser(),
        login: new LoginUser(),
        logout: new LogoutUser(),
        resetPassword: new ResetPassword(),
        forgotPassword: new ForgotPassword(),
        tokenRefresh: new TokenRefresh()
};
