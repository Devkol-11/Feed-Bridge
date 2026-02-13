export type FindJobsReadModel = {
        id: string; // Internal UUID
        title: string; // "Senior Backend Engineer"
        company: string; // "Acme Corp"
        category: string; // "Software Development"
        location: string; // "Remote" or "USA Only"
        salary: string; // "$120k - $150k" (Formatted for display)
        type: string; // "Full-time"
        jobUrl: string; // External link to apply
        postedAt: Date; // The original publication date
        sourceName: string; // Flattened: "Remotive" instead of the whole JobSource object
};

export interface FindJobsRepoPort {
        find(filters: {
                category?: string;
                location?: string;
                salary?: string;
                skip: number;
                take: number;
        }): Promise<FindJobsReadModel[]>;
}
