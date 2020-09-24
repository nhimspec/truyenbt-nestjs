import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as slug from 'slug';
import { CrawlService } from '@src/common/crawl/crawl.service';
import TagRepository from '@src/repositories/tag.repository';
import MangaDetailBusiness from './manga-detail.business';

@Injectable()
class MangaListBusiness {
    private readonly logger = new Logger(MangaListBusiness.name);
    protected baseUrl: string;
    protected crawledUrl: string[] = [];
    protected isContinue = true;

    constructor(
        private crawlService: CrawlService,
        private configService: ConfigService,
        private mangaDetailBusiness: MangaDetailBusiness,
        private tagRepository: TagRepository,
    ) {
        this.baseUrl = this.configService.get('MANGA_URL');
    }

    async execute() {
        this.logger.log('Start Crawl');

        await this.crawlTags();
        await this.crawlMangaDataList();

        this.logger.log('End Crawl');
    }

    /**
     * Crawl tags
     * @private
     */
    private async crawlTags(): Promise<void> {
        this.logger.log(`Start get list tags:`);

        const $ = await this.crawlService.getContent(this.baseUrl);
        if (!$) {
            return;
        }

        await this.crawlTagUrl($);

        this.logger.log(`End get list tags:`);
    }

    /**
     * Crawl tag url
     * @param $
     * @private
     */
    private async crawlTagUrl($: cheerio.Root): Promise<void> {
        const urlTags: { name: string; slug: string; url: string }[] = [];
        $('.navbar-menu .navbar-item.has-dropdown')
            .first()
            .find('.level .level-left a')
            .each((_idx: number, nodeItem: cheerio.Element) => {
                const url: string | undefined = $(nodeItem).attr('href');
                const name: string | undefined = $(nodeItem)
                    .text()
                    .trim();
                if (!!url && !!name) {
                    urlTags.push({ name, slug: slug(name), url: url.trim() });
                }
            });

        const tags: { name: string; slug: string; description: string }[] = [];
        for (const { url, slug, name } of urlTags) {
            const tagExits: boolean = await this.tagRepository.exists({ slug });
            if (!tagExits) {
                $ = await this.crawlService.getContent(url);
                if (!$) {
                    continue;
                }
                const description: string = $('.main-content .story-list .box')
                    .first()
                    .text()
                    .trim();

                tags.push({ name, description, slug });
            }
        }

        if (tags.length > 0) {
            await this.tagRepository.createMultiple(tags);
        }
    }

    /**
     * Crawl manga data list
     * @private
     */
    private async crawlMangaDataList() {
        this.logger.log(`Start get list manga:`);
        let page = 1;
        do {
            const mangaPageUrl = `${this.baseUrl}truyen-moi-cap-nhat/trang-${page}.html`;
            const $ = await this.crawlService.getContent(mangaPageUrl);
            if (!$) {
                continue;
            }

            if ($('.story-list .list-stories .story-item').length === 0) {
                break;
            }
            await this.crawlMangaList($);

            if (!this.isContinue) {
                break;
            }

            page++;
        } while (page < 3);
    }

    /**
     * Crawl manga list
     * @param $
     */
    private async crawlMangaList($: cheerio.Root): Promise<void> {
        let mangaDetailUrl: string | undefined;
        const mangaDetailUrls: string[] = [];
        $('.story-list .list-stories .story-item').each((_idx: number, nodeItem: cheerio.Element) => {
            mangaDetailUrl = $(nodeItem)
                .find('.title-book > a')
                .attr('href');
            if (!!mangaDetailUrl) {
                mangaDetailUrl = mangaDetailUrl.trim();
                // If It has'nt just been crawled, do it
                if (!this.crawledUrl.includes(mangaDetailUrl)) {
                    this.crawledUrl.push(mangaDetailUrl);
                    mangaDetailUrls.push(mangaDetailUrl);
                }
            }
        });

        for (const url of mangaDetailUrls) {
            this.isContinue = await this.mangaDetailBusiness.execute(url);
            if (!this.isContinue) {
                break;
            }
        }
    }
}

export default MangaListBusiness;
