export type UserPreferenceReadModel = {
        userId: string;
        categories: string[];
        locations: string[];
        minimumSalary: number;
        isAlertsEnabled: boolean;
};

export interface GetUserPreferenceRepoPort {
        fetchByUserId(userId: string): Promise<UserPreferenceReadModel | null>;
}
