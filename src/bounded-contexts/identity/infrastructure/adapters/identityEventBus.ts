import { IdentityEventBusPort } from '../ports/identityEventBusPort.js';
import { IDomainEvents } from '@src/shared/ddd/domainEvents.Base.js';
import { Queue } from 'bullmq';
import { Application_Queue } from '@src/config/redis/jobQueue/Queue.js';

export class BullMQ_Identity_EventBus implements IdentityEventBusPort {
        private readonly queue: Queue;
        private readonly queueName: string = 'identity_events';
        private readonly numberOfRetries: number = 5;

        constructor() {
                this.queue = Application_Queue.create(this.queueName);
        }

        async publish(event: IDomainEvents): Promise<void> {
                await this.queue.add(event.eventName, event, {
                        attempts: this.numberOfRetries,
                        backoff: {
                                type: 'exponential',
                                delay: 1000
                        },
                        removeOnComplete: true
                });
        }
}
