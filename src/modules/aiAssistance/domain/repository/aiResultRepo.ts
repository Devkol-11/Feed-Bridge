import { AIResumeSuggestion } from '../entities/aiResumeSuggestion.js';
import { AIResumeSuggestion as PrismaSuggestionModel } from 'generated/prisma/client.js';

export interface AIResultRepository {
        // Write: Domain Entity
        save(suggestion: AIResumeSuggestion): Promise<void>;

        // Reads: Raw DB Models (Read Models)
        findLatestByUserId(userId: string, limit: number): Promise<PrismaSuggestionModel[]>;
        findById(id: string): Promise<PrismaSuggestionModel | null>;
}
