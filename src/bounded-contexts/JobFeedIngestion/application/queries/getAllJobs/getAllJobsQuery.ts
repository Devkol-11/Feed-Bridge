export interface GetAllJobsQuery {
        page?: number;
        pageSize?: number;
        sourceId?: string; // Optional: filter by source
}
