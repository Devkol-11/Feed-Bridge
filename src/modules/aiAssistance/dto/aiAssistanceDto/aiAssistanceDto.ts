export interface ExtractJobRequirementsCommand {
        jobId: string;
        jobDescription: string;
}

export interface ImproveSectionCommand {
        userId: string;
        resumeId: string;
        sectionType: string;
        content: string;
}

export interface TailorResumeCommand {
        userId: string;
        resumeId: string;
        jobId: string;
        resumeSnapshot: any;
        jobDescription: string;
}
