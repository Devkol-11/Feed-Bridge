export type CreateUserPreferenceRequest = {
        userId: string;
        categories?: string[];
        locations?: string[];
        minimumSalary: number;
        isAlertsEnabled: boolean;
};

export type UpdateUserPreferenceRequest = {
        userId: string;
        categories: string[];
        locations: string[];
        minimumSalary: number;
};

export type ToggleAlertsRequest = {
        userId: string;
        isEnabled: boolean;
};

export type FindUsersMatchingJobRequest = {
        category: string;
        location: string;
};

export type GetUserPreferenceRequest = {
        userId: string;
};
