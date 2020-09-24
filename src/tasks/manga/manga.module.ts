import { Module } from '@nestjs/common';
import MangaListBusiness from './manga-list.business';
import { CrawlModule } from '@src/common/crawl/crawl.module';
import MangaDetailBusiness from './manga-detail.business';
import { RepositoryModule } from '@src/repositories/repository.module';
import MangaChapterBusiness from './manga-chapter.business';

@Module({
    imports: [CrawlModule, RepositoryModule],
    providers: [MangaListBusiness, MangaDetailBusiness, MangaChapterBusiness],
    exports: [MangaListBusiness],
})
export class MangaModule {}
