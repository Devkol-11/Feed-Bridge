import { XMLParser } from 'fast-xml-parser';
import axios from 'axios';
import { RawJobData } from '@src/bounded-contexts/JobFeedIngestion/application/ports/jobFetcherPort.js';
import { JobFetcherPort } from '@src/bounded-contexts/JobFeedIngestion/application/ports/jobFetcherPort.js';

export class WwrXmlAdapter implements JobFetcherPort {
        private parser: XMLParser;

        constructor() {
                this.parser = new XMLParser({
                        ignoreAttributes: false, // WWR sometimes uses attributes for IDs
                        attributeNamePrefix: '@_'
                });
        }

        async fetchJobs(url: string): Promise<RawJobData[]> {
                // Fetch the raw XML string
                const response = await axios.get<string>(url);

                const { data: xmlString } = response;

                // Parse string to JS Object
                const jsonObj = this.parser.parse(xmlString);

                //  Navigate the WWR path: rss -> channel -> item[]
                const items = Array.isArray(jsonObj.rss?.channel?.item)
                        ? jsonObj.rss.channel.item
                        : [jsonObj.rss.channel.item];

                if (!items[0]) return [];

                //  Map XML to our clean RawJobData
                return items.map((item: any) => {
                        return {
                                externalId: item.guid?.['#text'] || item.guid || item.link,
                                title: item.title,
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
