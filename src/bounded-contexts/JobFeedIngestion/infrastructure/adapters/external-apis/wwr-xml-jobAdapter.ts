import { XMLParser } from 'fast-xml-parser';
import axios from 'axios';
import { RawJobData } from '@src/bounded-contexts/JobFeedIngestion/application/ports/jobFetcherPort.js';
import { JobFetcherPort } from '@src/bounded-contexts/JobFeedIngestion/application/ports/jobFetcherPort.js';
import { JobSource } from '@src/bounded-contexts/JobFeedIngestion/domain/model/aggregates/jobSource.js';

export class WwrXmlJobAdapter implements JobFetcherPort {
        private parser: XMLParser;

        constructor() {
                this.parser = new XMLParser({
                        ignoreAttributes: false, // WWR sometimes uses attributes for IDs
                        attributeNamePrefix: '@_'
                });
        }

        async fetchJobs(source: JobSource): Promise<RawJobData[]> {
                // 1. Fetch the raw XML string

                const response = await axios.get<string>(source.props.baseUrl);

                const { data: xmlString } = response;

                // 2. Parse string to JS Object
                const jsonObj = this.parser.parse(xmlString);

                // 3. Navigate the WWR path: rss -> channel -> item[]
                // Defensive check: sometimes a feed only has one item, fast-xml-parser makes it an object instead of array
                const items = Array.isArray(jsonObj.rss?.channel?.item)
                        ? jsonObj.rss.channel.item
                        : [jsonObj.rss.channel.item];

                if (!items[0]) return [];

                // 4. Map the messy XML to our clean RawJobData
                return items.map((item: any) => {
                        return {
                                externalId: item.guid?.['#text'] || item.guid || item.link,
                                title: item.title,
                                // WWR quirk: Company name is often hidden in the description or title
                                // "Senior Dev at Google" -> split to get Google
                                company: this.extractCompany(item.title) || 'Unknown',
                                url: item.link,
                                location: 'Remote', // WWR is remote-first
                                publishedAt: new Date(item.pubDate)
                        };
                });
        }

        private extractCompany(title: string): string {
                if (title.includes(' at ')) {
                        return title.split(' at ')[1].trim();
                }
                return '';
        }
}
