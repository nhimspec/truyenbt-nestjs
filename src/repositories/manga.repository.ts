import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DocumentQuery, Model } from 'mongoose';
import { Manga } from '@src/schemas/manga.schema';
import BaseRepository from './base.repository';
import { paginate } from '@src/helpers/utils';
import { MangaChapter } from '@src/schemas/manga-chapter.schema';
import MangaChapterRepository from '@src/repositories/manga-chapter.repository';

@Injectable()
class MangaRepository extends BaseRepository<Manga> {
    @InjectModel(Manga.name) protected model: Model<Manga>;

    constructor(private mangaChapterRepository: MangaChapterRepository) {
        super();
    }

    getListPaginate(page: number, perPage: number) {
        const itemsQuery: DocumentQuery<Manga[], Manga> = this.find({})
            .populate({
                path: 'tags',
                select: '-__v',
            })
            .select('-__v -author')
            .limit(perPage)
            .skip(perPage * (page - 1))
            .sort({
                publishedAt: 'desc',
            });

        const totalQuery = this.countDocuments({});

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
}

export default MangaRepository;
