import { Injectable, Logger } from '@nestjs/common';
import { Timeout } from '@nestjs/schedule';
import MangaListBusiness from './manga/manga-list.business';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    constructor(private mangaListBusiness: MangaListBusiness) {}

    @Timeout(4000)
    handleCrawlManga() {
        this.mangaListBusiness.execute().catch(e => {
            this.logger.error('Error crawl data');
            this.logger.error(e);
        });
    }
}
