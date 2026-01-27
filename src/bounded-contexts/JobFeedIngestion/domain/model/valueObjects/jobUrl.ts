import { ValueObject } from '@src/shared/ddd/valueObjects.Base.js';

export class JobUrl extends ValueObject<{ value: string }> {
        protected validate() {
                try {
                        new URL(this.props.value);
                } catch {
                        throw new Error('Invalid Job URL format');
                }
        }
}
