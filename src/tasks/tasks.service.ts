import { Injectable, Logger } from '@nestjs/common';
import MangaListBusiness from '@src/business/crawler/manga-list.business';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    constructor(private mangaListBusiness: MangaListBusiness) {}

    // @Timeout(4000)
    handleCrawlManga() {
        this.mangaListBusiness.execute().catch(e => {
            this.logger.error('Error crawl data');
            this.logger.error(e);
        });
    }
}
