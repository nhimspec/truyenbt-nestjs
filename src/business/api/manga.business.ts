import { Injectable } from '@nestjs/common';
import { Paginate } from '@src/helpers/typeHelper';
import { Manga, MANGA_SORT_TYPE, MANGA_STATUS } from '@src/schemas/manga.schema';
import MangaRepository from '@src/repositories/manga.repository';
import { Aggregate } from 'mongoose';
import ChapterViewRepository from '@src/repositories/chapter-view.repository';
import { ChapterView } from '@src/schemas/chapter-view.schema';
import { DATE_SORT } from '@src/common/constants';
import MangaChapterRepository from '@src/repositories/manga-chapter.repository';
import { ConfigService } from '@nestjs/config';
import TagRepository from '@src/repositories/tag.repository';
import { MangaChapter } from '@src/schemas/manga-chapter.schema';
import { positiveVal } from '@src/helpers/utils';

@Injectable()
export default class MangaBusiness {
    private readonly uploadBaseUrl: string = '';

    constructor(
        private configService: ConfigService,
        private tagRepository: TagRepository,
        private mangaRepository: MangaRepository,
        private mangaChapterRepository: MangaChapterRepository,
        private chapterViewRepository: ChapterViewRepository,
    ) {
        this.uploadBaseUrl = this.configService.get('UPLOAD_BASE_URL');
    }

    /**
     * Get paginate latest manga
     * @param page
     * @param limit
     */
    async getListPaginate(page: number, limit: number): Promise<Paginate<Manga>> {
        let mangasPaginate: Paginate<Manga> = await this.mangaRepository.getListPaginate(page, limit);
        if (mangasPaginate.items.length > 0) {
            mangasPaginate = {
                ...mangasPaginate,
                items: await this.mangaRepository.mapMangaChapterToList(mangasPaginate.items, 3),
            };
        }

        return mangasPaginate;
    }

    /**
     * Get hot mangas
     * @param limit
     */
    async getHotMangas(limit: number): Promise<Manga[]> {
        let mangas: Manga[] = await this.mangaRepository
            .find({})
            .select('-__v -tags')
            .limit(positiveVal(limit, 15));

        mangas = await this.mangaRepository.mapMangaChapterToList(mangas, 1);

        return mangas;
    }

    /**
     * Get top mangas
     * @param dateSort
     */
    async getTopMangas(dateSort: DATE_SORT): Promise<Manga[]> {
        let query: Aggregate<Manga[]> = this.mangaRepository.aggregate();

        switch (dateSort) {
            case DATE_SORT.WEEK:
                query = this._querySortByDate(query, 7);
                break;
            case DATE_SORT.MONTH:
                query = this._querySortByDate(query, 30);
                break;
            case DATE_SORT.YEAR:
                query = this._querySortByDate(query, 365);
                break;
            default:
                query = this._querySortByDate(query, 7);
                break;
        }

        query = query
            .limit(5)
            .lookup({
                from: this.mangaChapterRepository.collectionName(),
                as: 'chapters',
                let: { mangaId: '$_id' },
                pipeline: [
                    {
                        $match: { $expr: { $eq: ['$manga', '$$mangaId'] } },
                    },
                    { $sort: { number: -1 } },
                    { $limit: 1 },
                    { $project: { number: 1, viewCount: 1, publishedAt: 1 } },
                ],
            })
            .project({ author: 0, __v: 0, tags: { __v: 0 } })
            .addFields({
                imagePreview: {
                    $concat: [this.uploadBaseUrl, '$imagePreview'],
                },
            });

        return query;
    }

    /**
     * Get Manga detail
     *
     * @param slug
     */
    async getMangaDetail(slug: string): Promise<Manga | null> {
        let manga: Manga | null = await this.mangaRepository
            .findOne({
                slug,
            })
            .populate({
                path: 'author',
                select: '-__v -mangas',
            })
            .populate({
                path: 'tags',
                select: '-__v -mangas',
            })
            .select('-__v');
        if (!!manga) {
            manga = await this.mangaRepository.setChapters(manga);
        }

        return manga;
    }

    /**
     * Show chapter manga detail
     * @param slug
     * @param chapter
     * @param userToken
     */
    async showChapterDetail(slug: string, chapter: number, userToken: string): Promise<Manga | null> {
        let manga: Manga | null = await this.mangaRepository
            .findOne({
                slug,
            })
            .select('name slug viewCount');
        let mangaChapter: MangaChapter | null = null;
        if (!!manga) {
            const chapterNumber: number = positiveVal(chapter, 0);
            mangaChapter = await this.mangaChapterRepository.findOneChapterByManga(manga, chapterNumber);

            if (!!mangaChapter) {
                const chapterView = await this.chapterViewRepository.findOneAndUpdateRaw(
                    { mangaChapter, manga, userToken },
                    { userToken },
                    { new: true, upsert: true, rawResult: true },
                );

                if (!!chapterView.lastErrorObject && !chapterView.lastErrorObject.updatedExisting) {
                    manga.viewCount = positiveVal(manga.viewCount, 0) + 1;
                    [mangaChapter, manga] = await Promise.all([
                        this.mangaChapterRepository
                            .findOneAndUpdate(
                                {
                                    manga: manga._id,
                                    number: chapterNumber,
                                },
                                {
                                    $inc: { viewCount: 1 },
                                },
                                { new: true },
                            )
                            .select('-__v')
                            .sort({ number: 'desc' }),
                        manga.save(),
                    ]);
                }

                mangaChapter = this.mangaChapterRepository.setImagesPath(mangaChapter, this.uploadBaseUrl);
                manga.set('chapter', mangaChapter, { strict: false });
            }
            manga = await this.mangaRepository.setChapters(manga);
        }

        return manga;
    }

    /**
     * Search mangas
     *
     * @param page
     * @param perPage
     * @param status
     * @param sort
     * @param tags
     */
    async searchMangas(
        page: number,
        perPage: number,
        status: MANGA_STATUS,
        sort: MANGA_SORT_TYPE,
        tags: string[],
    ): Promise<Paginate<Manga> | null> {
        let query: Aggregate<Paginate<Manga>[]> = this.mangaRepository.aggregate();
        if ([MANGA_STATUS.COMPLETE, MANGA_STATUS.CONTINUE].includes(status)) {
            query = query.match({ status: { $eq: status } });
        }

        if (!!tags && tags.length > 0) {
            const tagsIds: string[] = await this.tagRepository.find({ slug: { $in: tags } }).distinct('_id');
            query = query.match({ tags: { $in: tagsIds } });
        }

        switch (sort) {
            case MANGA_SORT_TYPE.BY_CREATED:
                query = query.sort({ createdAt: -1, publishedAt: -1 });
                break;
            case MANGA_SORT_TYPE.BY_TOP_ALL:
                query = query.sort({ viewCount: -1, publishedAt: -1 });
                break;
            case MANGA_SORT_TYPE.BY_TOP_YEAR:
                query = this._querySortByDate(query, 365);
                break;
            case MANGA_SORT_TYPE.BY_TOP_MONTH:
                query = this._querySortByDate(query, 30);
                break;
            case MANGA_SORT_TYPE.BY_TOP_WEEK:
                query = this._querySortByDate(query, 7);
                break;
            default:
                query = query.sort({ publishedAt: -1 });
                break;
        }

        query = query
            .project({ chapterViews: 0, author: 0, __v: 0, tags: { __v: 0 } })
            .addFields({
                imagePreview: {
                    $concat: [this.uploadBaseUrl, '$imagePreview'],
                },
            })
            .facet({
                items: [
                    { $skip: perPage * (page - 1) },
                    { $limit: perPage },
                    {
                        $lookup: {
                            from: this.tagRepository.collectionName(),
                            as: 'tags',
                            localField: 'tags',
                            foreignField: '_id',
                        },
                    },
                    {
                        $lookup: {
                            from: this.mangaChapterRepository.collectionName(),
                            as: 'chapters',
                            let: { mangaId: '$_id' },
                            pipeline: [
                                {
                                    $match: { $expr: { $eq: ['$manga', '$$mangaId'] } },
                                },
                                { $sort: { number: -1 } },
                                { $limit: 3 },
                                { $project: { number: 1, viewCount: 1, publishedAt: 1 } },
                            ],
                        },
                    },
                ],
                total: [{ $count: 'total' }],
            })
            .addFields({
                total: {
                    $ifNull: [{ $arrayElemAt: ['$total.total', 0] }, 0],
                },
            })
            .addFields({
                totalPages: {
                    $ceil: {
                        $divide: ['$total', perPage],
                    },
                },
                page,
                perPage,
            });

        const result = await query;

        return result.length > 0 ? result[0] : null;
    }

    _querySortByDate(query: Aggregate<any>, days: number) {
        const sortDate: Date = new Date(new Date().getTime() - days * 24 * 60 * 60 * 1000);
        return query
            .lookup({
                from: ChapterView.name,
                as: 'chapterViews',
                let: { mangaId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [{ $eq: ['$manga', '$$mangaId'] }, { $gte: ['$updatedAt', sortDate] }],
                            },
                        },
                    },
                ],
            })
            .addFields({
                chapterViews: {
                    $size: '$chapterViews',
                },
            })
            .sort({ chapterViews: -1, publishedAt: -1 });
    }
}
