import { ExtractJobRequirements } from './application/extractJobRequirementsHandler.js';
import { TailorResume } from './application/tailorResumeHandler.js';
import { GetLastAISuggestions } from './application/getLatestAiSuggestionsHandler.js';
import { PreviewTailoredResume } from './application/previewTailoredResumeHandler.js';
import { ImproveSection } from './application/improveSectionHandler.js';

export const aiAssistance_usecase_http = {
        extractJobRequirements: new ExtractJobRequirements(),
        improveSection: new ImproveSection(),
        tailorResume: new TailorResume(),
        getLatestAiSuggestions: new GetLastAISuggestions(),
        previewTailoredResume: new PreviewTailoredResume()
};
