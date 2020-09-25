import { Module } from '@nestjs/common';
import { CrawlModule } from '@src/common/crawl/crawl.module';
import { RepositoryModule } from '@src/repositories/repository.module';
import MangaBusiness from '@src/business/api/manga.business';
import MangaListBusiness from '@src/business/crawler/manga-list.business';
import MangaDetailBusiness from '@src/business/crawler/manga-detail.business';
import MangaChapterBusiness from '@src/business/crawler/manga-chapter.business';
import TagBusiness from '@src/business/api/tag.business';

@Module({
    imports: [RepositoryModule, CrawlModule],
    providers: [MangaBusiness, TagBusiness, MangaListBusiness, MangaDetailBusiness, MangaChapterBusiness],
    exports: [MangaBusiness, TagBusiness, MangaListBusiness],
})
export class BusinessModule {}
