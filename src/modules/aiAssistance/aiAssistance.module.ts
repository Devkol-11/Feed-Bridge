import { ExtractJobRequirements } from './application/commands/extractJobRequirements/extractJobRequirementsHandler.js';
import { ImproveSection } from './application/commands/improveSection/improveSectionHandler.js';
import { TailorResume } from './application/commands/tailorResume/tailorResumeHandler.js';
import { GetLastAISuggestions } from './application/queries/getLatestAiSuggestions.ts/getLatestAiSuggestionsHandler.js';
import { PreviewTailoredResume } from './application/queries/previewTailoredResume/previewTailoredResumeHandler.js';
import { PrismaAIResultRepo } from './infrastructure/persistence/prisma.js';
import { HuggingFaceAIProvider } from './infrastructure/adapters/huggingFaceAi.js';

import { getEnv } from '@src/config/env/env.js';
const HUGGING_FACE_API_KEY = getEnv().HUGGING_FACE_API_KEY;
const HUGGING_FACE_AI = new HuggingFaceAIProvider(HUGGING_FACE_API_KEY);
const prismaAIResultRepo = new PrismaAIResultRepo();

const extractJobRequirements = new ExtractJobRequirements(HUGGING_FACE_AI);
const improveSection = new ImproveSection(HUGGING_FACE_AI, prismaAIResultRepo);
const tailorResume = new TailorResume(HUGGING_FACE_AI, prismaAIResultRepo);
const getLatestAiSuggestions = new GetLastAISuggestions(prismaAIResultRepo);
const previewTailoredResume = new PreviewTailoredResume(HUGGING_FACE_AI);

export const usecaseHttp = {
        extractJobRequirements,
        improveSection,
        tailorResume,
        getLatestAiSuggestions,
        previewTailoredResume
};
