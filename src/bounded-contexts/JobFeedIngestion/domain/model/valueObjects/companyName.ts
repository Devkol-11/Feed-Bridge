import { ValueObject } from '@src/shared/ddd/valueObjects.Base.js';

export class CompanyName extends ValueObject<{ value: string }> {
        protected validate() {
                const { value } = this.props;
                if (!value || value.trim().length < 1) {
                        throw new Error('Company name cannot be empty');
                }
        }

        // Helper to get raw value for Prisma
        public getValue(): string {
                return this.props.value.trim();
        }
}
