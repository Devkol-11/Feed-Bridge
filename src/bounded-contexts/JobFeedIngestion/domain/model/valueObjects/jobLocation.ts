import { ValueObject } from '@src/shared/ddd/valueObjects.Base.js';

export class JobLocation extends ValueObject<{ value: string }> {
        protected validate() {
                const { value } = this.props;
                if (!value || value.trim().length < 2) {
                        throw new Error('Location must be specified (at least 2 characters)');
                }
        }

        public getValue(): string {
                // Add logic here to normalize "LAGOS, NG" to "Lagos, Nigeria"
                return this.props.value.trim();
        }
}
