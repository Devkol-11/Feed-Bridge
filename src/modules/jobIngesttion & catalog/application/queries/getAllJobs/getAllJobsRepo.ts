export type GetAllJobsReadModel = {
        id: string;
        title: string;
        company: string;
        category: string;
        location: string;
        salary: string;
        type: string;
        jobUrl: string;
        postedAt: Date;
        sourceName: string;
};

export interface GetAllJobsRepoPort {
        findAll(params: {
                skip: number;
                take: number;
                category?: string;
                location?: string;
        }): Promise<GetAllJobsReadModel[]>;
}
