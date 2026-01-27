import { IDomainEvents } from '@src/shared/ddd/domainEvents.Base.js';

export interface IdentityEventBusPort {
        publish(event: IDomainEvents): Promise<void>;
}
