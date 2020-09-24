import { HttpService, Injectable, Logger } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import * as fs from 'fs';
import * as cheerio from 'cheerio';

const CONNECT_TIME_OUT = 8000;

interface StreamFileResponse {
    pipe(writeSteam: fs.WriteStream): Promise<void>;
}

@Injectable()
export class CrawlService {
    private readonly logger = new Logger(CrawlService.name);

    constructor(private httpService: HttpService) {}

    async getContent(url: string): Promise<cheerio.Root | null> {
        const data: string | null = await this.getData(url);
        return !!data ? cheerio.load(data) : null;
    }

    /**
     * Get data from url
     * @param url
     */
    async getData(url: string): Promise<string | null> {
        try {
            const response: AxiosResponse = await this.httpService
                .get(url, {
                    timeout: CONNECT_TIME_OUT,
                    headers: {
                        Accept:
                            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        'User-Agent': CrawlService.getRandomUserAgent(),
                        'Accept-Encoding': 'gzip, deflate',
                        'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8,es;q=0.7,ja;q=0.6',
                        'Cache-Control': 'no-cache',
                        Connection: 'keep-alive',
                        Pragma: 'no-cache',
                        'Upgrade-Insecure-Requests': '1',
                    },
                })
                .toPromise();

            return response.data;
        } catch (e) {
            this.logger.error(`Axios client get content: ${url}`, e);
            return null;
        }
    }

    async downloadFromUrl(
        referer: string,
        fileUrl: string,
        fullPath: string,
        fileName: string,
    ): Promise<string | null> {
        const steamResp = await this.getFileData(referer, fileUrl);
        if (!!steamResp) {
            const download = fs.createWriteStream(`${fullPath}/${fileName}`);

            await new Promise((resolve, reject) => {
                steamResp.pipe(download);
                download.on('close', resolve);
                download.on('error', reject);
            });

            return fullPath + fileName;
        } else {
            return null;
        }
    }

    /**
     * Get image file from url
     * @param referer
     * @param url
     */
    async getFileData(referer: string, url: string): Promise<StreamFileResponse> {
        const response: AxiosResponse = await this.httpService
            .get(url, {
                timeout: CONNECT_TIME_OUT,
                headers: {
                    Accept:
                        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                    'User-Agent': CrawlService.getRandomUserAgent(),
                    'Accept-Encoding': 'gzip, deflate',
                    'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8,es;q=0.7,ja;q=0.6',
                    'Cache-Control': 'no-cache',
                    Connection: 'keep-alive',
                    Pragma: 'no-cache',
                    'Upgrade-Insecure-Requests': '1',
                    Referer: referer,
                },
                responseType: 'stream',
            })
            .toPromise();

        return response.data;
    }

    /**
     * Get random user agent
     * @return string
     */
    private static getRandomUserAgent() {
        const userAgent: string[] = [
            'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-GB; rv:1.8.1.6)    Gecko/20070725 Firefox/2.0.0.6',
            'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1)',
            'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; .NET CLR 1.1.4322; .NET CLR 2.0.50727; .NET CLR 3.0.04506.30)',
            'Opera/9.20 (Windows NT 6.0; U; en)',
            'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; en) Opera 8.50',
            'Mozilla/4.0 (compatible; MSIE 6.0; MSIE 5.5; Windows NT 5.1) Opera 7.02 [en]',
            'Mozilla/5.0 (Macintosh; U; PPC Mac OS X Mach-O; fr; rv:1.7) Gecko/20040624 Firefox/0.9',
            'Mozilla/5.0 (Macintosh; U; PPC Mac OS X; en) AppleWebKit/48 (like Gecko) Safari/48',
            'Mozilla/5.0 (Macintosh; U; PPC Mac OS X; en) AppleWebKit/48 (like Gecko) Safari/48',
        ];

        return userAgent[Math.floor(Math.random() * userAgent.length)];
    }
}
