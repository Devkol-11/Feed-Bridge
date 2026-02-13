export interface TailorResumeCommand {
        userId: string;
        resumeId: string;
        jobId: string;
        resumeSnapshot: any; // Full resume data
        jobDescription: string;
}
