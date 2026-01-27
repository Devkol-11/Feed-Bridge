//---REGISTER---

export interface RegisterRequestDto {
        email: string;
        firstName: string;
        lastName: string;
        password: string;
}

export interface RegisterResponseDto {
        message: string;
        data: { email: string; firstName: string; lastName: string };
        tokens: { accessToken: string; refreshToken: string };
}

// --- LOGIN ---
export interface LoginRequestDto {
        email: string;
        password: string;
}

export interface LoginResponseDto {
        message: string;
        data: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
        };
        tokens: {
                accessToken: string;
                refreshToken: string;
        };
}

// --- PASSWORD RESET ---
export interface ForgotPasswordRequestDto {
        email: string;
}

export interface ResetPasswordRequestDto {
        incomingToken: string;
        newPassword: string;
}

// --- LOGOUT ---
export interface LogoutRequestDto {
        userId: string;
        refreshToken: string;
}
