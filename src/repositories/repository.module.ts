import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import MangaChapterRepository from './manga-chapter.repository';
import AuthorRepository from './author.repository';
import MangaRepository from './manga.repository';
import TagRepository from './tag.repository';
import ChapterViewRepository from '@src/repositories/chapter-view.repository';
import UserRepository from '@src/repositories/user.repository';
import { Tag, TagSchema } from '@src/schemas/tag.schema';
import { Manga, MangaSchema } from '@src/schemas/manga.schema';
import { MangaChapter, MangaChapterSchema } from '@src/schemas/manga-chapter.schema';
import { Author, AuthorSchema } from '@src/schemas/author.schema';
import { ChapterView, ChapterViewSchema } from '@src/schemas/chapter-view.schema';
import { User, UserSchema } from '@src/schemas/user.schema';
import { IsExistsUserConstraint } from '@src/validators/is-exists-user.decorator';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Tag.name, schema: TagSchema },
            { name: Manga.name, schema: MangaSchema },
            { name: MangaChapter.name, schema: MangaChapterSchema },
            { name: ChapterView.name, schema: ChapterViewSchema },
            { name: Author.name, schema: AuthorSchema },
        ]),
    ],
    providers: [
        IsExistsUserConstraint,
        UserRepository,
        MangaChapterRepository,
        AuthorRepository,
        ChapterViewRepository,
        MangaRepository,
        TagRepository,
    ],
    exports: [
        UserRepository,
        MangaChapterRepository,
        AuthorRepository,
        ChapterViewRepository,
        MangaRepository,
        TagRepository,
    ],
})
export class RepositoryModule {}
