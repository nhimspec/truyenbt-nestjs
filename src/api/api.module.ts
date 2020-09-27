import { Module } from '@nestjs/common';
import { BusinessModule } from '@src/business/business.module';
import { MangaController } from '@src/api/manga/manga.controller';
import { ConfigService } from '@nestjs/config';
import { TagController } from '@src/api/tag/tag.controller';
import { AuthModule } from '@src/auth/auth.module';
import { AuthController } from '@src/api/auth/auth.controller';

@Module({
    imports: [BusinessModule, AuthModule, ConfigService],
    controllers: [MangaController, AuthController, TagController],
})
export class ApiModule {}
