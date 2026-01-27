import { IDomainEvents } from '@src/shared/ddd/domainEvents.Base.js';

export namespace DomainEvents {
        export class JobIngestedEvent implements IDomainEvents {
                eventName: string;
                occurredAt: Date;
                data: Record<string, unknown>;

                constructor(data: {}) {
                        this.eventName = 'job_ingested_event';
                        this.occurredAt = new Date();
                        this.data = data;
                }
        }
}
