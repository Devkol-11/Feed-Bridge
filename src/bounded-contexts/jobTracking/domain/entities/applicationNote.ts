import { Entity } from '@src/shared/ddd/entity.Base.js';
import { randomUUID } from 'node:crypto';

export interface ApplicationNoteProps {
        applicationId: string;
        content: string;
        createdAt: Date;
}

export class ApplicationNote extends Entity<ApplicationNoteProps> {
        private constructor(props: ApplicationNoteProps, id: string) {
                super(props, id);
        }

        public static create(applicationId: string, content: string): ApplicationNote {
                if (content.length < 3) throw new Error('Note content is too short.');

                return new ApplicationNote(
                        {
                                applicationId,
                                content,
                                createdAt: new Date()
                        },
                        randomUUID()
                );
        }

        public static rehydrate(props: ApplicationNoteProps, id: string): ApplicationNote {
                return new ApplicationNote(props, id);
        }
}
