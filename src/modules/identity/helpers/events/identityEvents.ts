import { IDomainEvents } from '@src/shared/base/eventsBase.js';

export namespace IdentityEvents {
        export class ResetTokenAddedEvent implements IDomainEvents {
                readonly eventName: string;
                readonly occurredAt: Date;
                readonly data: Record<string, unknown>;

                constructor(data: { userId: string; token: string; email: string }) {
                        this.eventName = 'Token:Added';
                        this.occurredAt = new Date();
                        this.data = data;
                }
        }

        export class UserRegisteredEvent implements IDomainEvents {
                readonly eventName: string;
                readonly occurredAt: Date;
                readonly data: Record<string, unknown>;

                constructor(data: { userId: string; email: string }) {
                        this.eventName = 'User:Registered';
                        this.occurredAt = new Date();
                        this.data = data;
                }
        }

        export class PasswordUpdatedEvent implements IDomainEvents {
                readonly eventName: string;
                readonly occurredAt: Date;
                readonly data: Record<string, unknown>;

                constructor(data: { userId: string; email: string }) {
                        this.eventName = 'Password:Reset';
                        this.occurredAt = new Date();
                        this.data = data;
                }
        }

        export class UserForgotPasswordEvent implements IDomainEvents {
                readonly eventName: string;
                readonly occurredAt: Date;
                readonly data: Record<string, unknown>;
                constructor(data: { userId: string; email: string; token: string }) {
                        this.eventName = 'Forgot:Password';
                        this.occurredAt = new Date();
                        this.data = data;
                }
        }
}
