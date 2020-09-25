import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tag, TagSchema } from '@src/schemas/tag.schema';
import { Manga, MangaSchema } from '@src/schemas/manga.schema';
import { MangaChapter, MangaChapterSchema } from '@src/schemas/manga-chapter.schema';
import { Author, AuthorSchema } from '@src/schemas/author.schema';
import MangaChapterRepository from './manga-chapter.repository';
import AuthorRepository from './author.repository';
import MangaRepository from './manga.repository';
import TagRepository from './tag.repository';
import { ChapterView, ChapterViewSchema } from '@src/schemas/chapter-view.schema';
import ChapterViewRepository from '@src/repositories/chapter-view.repository';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Tag.name, schema: TagSchema },
            { name: Manga.name, schema: MangaSchema },
            { name: MangaChapter.name, schema: MangaChapterSchema },
            { name: ChapterView.name, schema: ChapterViewSchema },
            { name: Author.name, schema: AuthorSchema },
        ]),
    ],
    providers: [MangaChapterRepository, AuthorRepository, ChapterViewRepository, MangaRepository, TagRepository],
    exports: [MangaChapterRepository, AuthorRepository, ChapterViewRepository, MangaRepository, TagRepository],
})
export class RepositoryModule {}
