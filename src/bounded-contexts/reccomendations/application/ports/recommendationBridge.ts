export interface RecommendationBridge {
        getSearchProfile(userId: string): Promise<{
                categories: string[];
                locations: string[];
        }>;

        getCandidateJobs(limit: number): Promise<
                Array<{
                        id: string;
                        title: string;
                        category: string;
                        location: string;
                }>
        >;

        /**
         * Fetches all user IDs who have an active search profile
         * and have enabled alerts/recommendations.
         */
        getActiveUserIds(): Promise<string[]>;

        getSearchProfile(userId: string): Promise<{
                categories: string[];
                locations: string[];
        }>;

        getCandidateJobs(limit: number): Promise<
                Array<{
                        id: string;
                        title: string;
                        category: string;
                        location: string;
                }>
        >;
}
