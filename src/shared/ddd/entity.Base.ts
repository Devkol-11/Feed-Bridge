export abstract class Entity<T> {
        protected id: string;
        props: Omit<T, 'id'>;
        constructor(props: Omit<T, 'id'>, id: string) {
                this.id = id;
                this.props = props;
        }

        public equals(object: Entity<T>): boolean {
                return this.id == object.id;
        }

        public getProps() {
                return {
                        id: this.id,
                        ...this.props
                };
        }
}
