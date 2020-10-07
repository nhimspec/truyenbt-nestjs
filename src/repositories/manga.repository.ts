import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DocumentQuery, FilterQuery, Model } from 'mongoose';
import { Manga } from '@src/schemas/manga.schema';
import BaseRepository from './base.repository';
import { paginate } from '@src/helpers/utils';
import { MangaChapter } from '@src/schemas/manga-chapter.schema';
import MangaChapterRepository from '@src/repositories/manga-chapter.repository';
import MangaFollowRepository from '@src/repositories/manga-follow.repository';
import { MangaFollow } from '@src/schemas/manga-follow.schema';
import MangaLikeRepository from '@src/repositories/manga-like.repository';
import { MangaLike } from '@src/schemas/manga-like.schema';

@Injectable()
class MangaRepository extends BaseRepository<Manga> {
    @InjectModel(Manga.name) protected model: Model<Manga>;

    constructor(
        private mangaChapterRepository: MangaChapterRepository,
        private mangaFollowRepository: MangaFollowRepository,
        private mangaLikeRepository: MangaLikeRepository,
    ) {
        super();
    }

    getListPaginate(page: number, perPage: number, conditions?: FilterQuery<Manga>) {
        const filters = conditions ? conditions : {};
        const itemsQuery: DocumentQuery<Manga[], Manga> = this.find(filters)
            .limit(perPage)
            .skip(perPage * (page - 1))
            .select('-__v -author')
            .populate({
                path: 'tags',
                select: '-__v',
            })
            .sort({
                publishedAt: 'desc',
            });

        const totalQuery = this.countDocuments(filters);

        return paginate<Manga>(itemsQuery, totalQuery, page, perPage);
    }

    /**
     * Map manga chapter to list mangas
     *
     * @param mangas
     * @param limit
     */
    mapMangaChapterToList(mangas: Manga[], limit?: number) {
        return Promise.all(mangas.map(manga => this.setChapters(manga, limit)));
    }

    /**
     * Set chapters property to manga
     *
     * @param manga
     * @param limit
     */
    async setChapters(manga: Manga, limit?: number): Promise<Manga> {
        const chapters: MangaChapter[] = await this.mangaChapterRepository.findChaptersByManga(manga, limit);
        manga.set('chapters', chapters, { strict: false });

        return manga;
    }

    /**
     * Set followed property to manga
     *
     * @param manga
     * @param accessCountToken
     */
    async setPropertyFollowed(manga: Manga, accessCountToken: string): Promise<Manga> {
        const mangaFollow: MangaFollow | null = await this.mangaFollowRepository.findOne({ manga, accessCountToken });
        manga.set('isFollow', !!mangaFollow, { strict: false });

        return manga;
    }

    /**
     * Set like property to manga
     *
     * @param manga
     * @param accessCountToken
     */
    async setPropertyLike(manga: Manga, accessCountToken: string): Promise<Manga> {
        const mangaLike: MangaLike | null = await this.mangaLikeRepository.findOne({ manga, accessCountToken });
        manga.set('isLike', !!mangaLike, { strict: false });

        return manga;
    }
}

export default MangaRepository;
