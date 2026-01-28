export type TransactionWork<T> = (tx: any) => Promise<T>;

export interface TransactionScriptPort {
        /**
         * Executes a set of operations within a single database transaction.
         * @param work - A function containing the repository calls
         */
        run<T>(work: TransactionWork<T>): Promise<T>;
}
