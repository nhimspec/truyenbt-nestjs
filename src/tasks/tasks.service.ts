import { Injectable, Logger } from '@nestjs/common';
import MangaListBusiness from '@src/business/crawler/manga-list.business';
import { Cron, CronExpression } from '@nestjs/schedule';
import { getDirectories, rmDir } from '@src/helpers/utils';
import * as path from 'path';
import * as dayjs from 'dayjs';
import { DATE_FORMAT } from '@src/common/constants';

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

    @Cron(CronExpression.EVERY_DAY_AT_11AM)
    handleRemoveLog() {
        const logsPath: string = path.join(__dirname, '../../', 'logs/');
        const date = dayjs()
            .subtract(14, 'day')
            .format(DATE_FORMAT);

        getDirectories(logsPath).forEach(async logDirName => {
            if (logDirName < date) {
                await rmDir(path.join(logsPath, logDirName));
            }
        });
    }
}
