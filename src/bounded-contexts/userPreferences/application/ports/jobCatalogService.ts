export interface JobCatalogService {
        countJobsByCriteria(criteria: { categories: string[]; locations: string[] }): Promise<number>;
        findUsersMatchingJob(category: string, location: string): Promise<string[]>;
}
