import { AggregateRoot } from '@src/shared/ddd/agggragateRoot.Base.js';
import { randomUUID } from 'node:crypto';
import { DomainErrors } from '../../exceptions/domainErrors.js';

interface ResetTokenProps {
        id: string;
        identityUserId: string;
        value: string;
        expiresAt: Date;
        isExpired: boolean;
        isValid: boolean;
        createdAt: Date;
        updatedAt: Date;
}

export class ResetToken extends AggregateRoot<ResetTokenProps> {
        private constructor(readonly props: Omit<ResetTokenProps, 'id'>, readonly id: string) {
                super(props, id);
        }

        static create(
                props: Omit<ResetTokenProps, 'id' | 'isExpired' | 'isValid' | 'createdAt' | 'updatedAt'>
        ): ResetToken {
                const id = randomUUID();
                return new ResetToken(
                        {
                                identityUserId: props.identityUserId,
                                value: props.value,
                                expiresAt: props.expiresAt,
                                isExpired: false,
                                isValid: true,
                                createdAt: new Date(),
                                updatedAt: new Date()
                        },
                        id
                );
        }

        static rehydrate(props: ResetTokenProps): ResetToken {
                return new ResetToken(
                        {
                                identityUserId: props.identityUserId,
                                value: props.value,
                                expiresAt: props.expiresAt,
                                isExpired: props.isExpired,
                                isValid: props.isValid,
                                createdAt: props.createdAt,
                                updatedAt: props.updatedAt
                        },
                        props.id
                );
        }

        getprops() {
                return { id: this.id, ...this.props };
        }

        /**
         * Business Logic: Checks if the system clock has passed the expiry date
         */
        public isExpired(): boolean {
                return new Date() > this.props.expiresAt;
        }

        /**
         * Business Logic: Comprehensive check for the Aggregate
         */
        public ensureIsActive(): void {
                if (!this.props.isValid) {
                        throw new DomainErrors.InvalidResetTokenError('Token has been manually invalidated.');
                }

                if (this.props.isExpired || this.isExpired()) {
                        throw new DomainErrors.InvalidResetTokenError('Token has expired.');
                }
        }

        /**
         * State Change: Marks the token as dead.
         */
        public invalidate(): void {
                this.props.isValid = false;
                this.props.isExpired = true;
                this.props.updatedAt = new Date();
        }

        // --- Getters for easier Aggregate access ---
}
