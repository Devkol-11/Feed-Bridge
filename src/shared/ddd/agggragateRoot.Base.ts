import { Entity } from './entity.Base.js';
import { IDomainEvents } from './domainEvents.Base.js';

export abstract class AggregateRoot<T> extends Entity<T> {
        private domainEvents: IDomainEvents[] = [];

        // Only internal methods or children can record events
        protected addDomainEvent(event: IDomainEvents): void {
                this.domainEvents.push(event);
        }

        public addSingleEvent(event: IDomainEvents) {
                this.domainEvents.push(event);
        }

        // Public because the Dispatcher/Use-Case needs to "pull" them out
        public pullDomainEvents(): IDomainEvents[] {
                const events = [...this.domainEvents];
                this.clearDomainEvents();
                return events;
        }

        private clearDomainEvents(): void {
                this.domainEvents = [];
        }

        public getProps() {
                return {
                        id: this.id,
                        ...this.props
                };
        }
}
