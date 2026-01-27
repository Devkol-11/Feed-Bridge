export abstract class ValueObject<T> {
        readonly props: T;

        constructor(props: T) {
                this.props = Object.freeze(props); // Immutable
                this.validate(); // optional validation in subclass
        }

        protected validate() {
                // override in subclass for validation
        }

        public equals(vo?: ValueObject<T>): boolean {
                if (vo === null || vo === undefined) return false;
                return JSON.stringify(this.props) === JSON.stringify(vo.props);
        }
}
