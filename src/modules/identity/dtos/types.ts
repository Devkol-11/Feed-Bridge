import type { IdentityUserRole } from 'generated/prisma/enums.js';

export type JWT_CLAIMS = {
        id: string;
        firstName: string;
        email: string;
        role: IdentityUserRole;
};
