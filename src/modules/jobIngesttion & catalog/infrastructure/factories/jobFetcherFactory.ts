import { JobFetcherPort } from '../../application/ports/jobFetcherPort.js';
import { RemotiveJsonAdapter } from '../adapters/external-apis/remotive-json-jobAdapter.js';
import { WwrXmlAdapter } from '../adapters/external-apis/wwr-xml-jobAdapter.js';

export class JobFetcherFactory {
        private adapters: Map<string, JobFetcherPort>;

        constructor(remotiveAdapter: RemotiveJsonAdapter, wwrAdapter: WwrXmlAdapter) {
                this.adapters = new Map<string, JobFetcherPort>([
                        ['REMOTIVE', remotiveAdapter],
                        ['WWR', wwrAdapter]
                ]);
        }

        getFetcher(provider: string): JobFetcherPort {
                const key = provider.trim().toUpperCase();

                const adapter = this.adapters.get(key);
                if (!adapter) {
                        throw new Error(`No fetcher adapter found for source: ${key}`);
                }

                return adapter;
        }
}
