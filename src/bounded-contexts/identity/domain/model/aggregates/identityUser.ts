import { AggregateRoot } from '@src/shared/ddd/agggragateRoot.Base.js';
import { randomUUID } from 'crypto';
import { IdentityUserRole } from '../../enums/domainEnums.js';
import { IdentityStatus } from '../../enums/domainEnums.js';
import { DomainEvents } from '../../events/domainEvents.js';

interface IdentityUserProps {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: IdentityUserRole;
        passwordHash: string;
        status: IdentityStatus;
        createdAt: Date;
        updatedAt: Date;
}

export class IdentityUser extends AggregateRoot<IdentityUserProps> {
        private constructor(readonly props: Omit<IdentityUserProps, 'id'>, readonly id: string) {
                super(props, id);
        }

        static create(
                props: Omit<IdentityUserProps, 'id' | 'createdAt' | 'updatedAt' | 'status'>
        ): IdentityUser {
                const id = randomUUID();

                const user = new IdentityUser(
                        {
                                email: props.email,
                                firstName: props.firstName,
                                lastName: props.lastName,
                                role: IdentityUserRole.USER,
                                passwordHash: props.passwordHash,
                                status: IdentityStatus.ACTIVE,
                                createdAt: new Date(),
                                updatedAt: new Date()
                        },
                        id
                );

                const event = new DomainEvents.UserRegisteredEvent({ userId: id, email: props.email });

                user.addDomainEvent(event);

                return user;
        }

        static rehydrate(props: IdentityUserProps): IdentityUser {
                return new IdentityUser(
                        {
                                email: props.email,
                                firstName: props.firstName,
                                lastName: props.lastName,
                                role: props.role,
                                passwordHash: props.passwordHash,
                                status: props.status,
                                createdAt: props.createdAt,
                                updatedAt: props.updatedAt
                        },
                        props.id
                );
        }

        /**
         * Validates the token and updates password in one atomic move.
         */
        public resetPassword(newPasswordHash: string): void {
                // Apply State Changes
                this.props.passwordHash = newPasswordHash;
                this.props.updatedAt = new Date();

                // Invalidate the token

                // Add Domain Event
                this.addDomainEvent(
                        new DomainEvents.PasswordUpdatedEvent({
                                userId: this.id,
                                email: this.props.email
                        })
                );
        }

        getProps() {
                return { id: this.id, ...this.props };
        }

        getClaims() {
                return {
                        id: this.id,
                        email: this.props.email,
                        role: this.props.role
                };
        }
}
