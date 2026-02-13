export interface IDomainEvents {
        /** The name of the event (e.g., 'UserRegistered') */
        readonly eventName: string;

        /** When the event was created in the domain */
        readonly occurredAt: Date;

        /** The actual data payload */
        readonly data: Record<string, unknown>;
}
