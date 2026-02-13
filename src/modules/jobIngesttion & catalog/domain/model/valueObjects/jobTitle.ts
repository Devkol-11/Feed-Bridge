import { ValueObject } from '@src/shared/ddd/valueObjects.Base.js';

export class JobTitle extends ValueObject<{ value: string }> {
        protected validate() {
                if (!this.props.value || this.props.value.trim().length < 2) {
                        throw new Error('Job title must be at least 2 characters long');
                }
        }
}
