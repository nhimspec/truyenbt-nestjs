import { Module } from '@nestjs/common';
import { BusinessModule } from '@src/business/business.module';
import { MangaController } from '@src/api/manga/manga.controller';
import { ConfigService } from '@nestjs/config';
import { TagController } from '@src/api/tag/tag.controller';

@Module({
    imports: [BusinessModule, ConfigService],
    controllers: [MangaController, TagController],
})
export class ApiModule {}
