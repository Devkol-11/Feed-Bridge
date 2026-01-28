import { AggregateRoot } from '@src/shared/ddd/agggragateRoot.Base.js';
import { randomUUID } from 'node:crypto';

interface refreshTokenProps {
        id: string;
        value: string;
        identityUserId: string;
        expiresAt: Date;
        isRevoked: boolean;
        createdAt: Date;
        updatedAt: Date;
}

export class RefreshToken extends AggregateRoot<refreshTokenProps> {
        private constructor(readonly props: Omit<refreshTokenProps, 'id'>, readonly id: string) {
                super(props, id);
        }

        static create(props: Omit<refreshTokenProps, 'id' | 'isRevoked' | 'createdAt' | 'updatedAt'>) {
                const id = randomUUID();
                return new RefreshToken(
                        {
                                value: props.value,
                                identityUserId: props.identityUserId,
                                expiresAt: new Date(props.expiresAt),
                                isRevoked: false,
                                createdAt: new Date(),
                                updatedAt: new Date()
                        },
                        id
                );
        }

        static rehydrate(data: any): RefreshToken {
                return new RefreshToken(
                        {
                                value: data.value,
                                identityUserId: data.identityUserId,
                                expiresAt: data.expiresAt,
                                isRevoked: data.isRevoked,
                                createdAt: data.createdAt,
                                updatedAt: data.updatedAt
                        },
                        data.id
                );
        }

        getProps() {
                return { id: this.id, ...this.props };
        }

        get isRevoked(): boolean {
                if (this.props.isRevoked == true) {
                        return true;
                }

                return false;
        }

        revoke() {
                this.props.isRevoked = true;
        }
}
