export class CronJobs {
        private jobRegistry: Map<string, Function>;

        constructor() {
                this.jobRegistry = new Map();
        }

        register(job: string, handler: Function) {
                this.jobRegistry.set(job, handler);
        }
}
