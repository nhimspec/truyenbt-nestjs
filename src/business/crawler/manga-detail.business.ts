import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as slug from 'slug';
import { CrawlService } from '@src/common/crawl/crawl.service';
import { Tag } from '@src/schemas/tag.schema';
import { Manga, MANGA_STATUS } from '@src/schemas/manga.schema';
import { Author } from '@src/schemas/author.schema';
import { PropType } from '@src/helpers/typeHelper';
import { fileExists, mkdir, rmDir } from '@src/helpers/utils';
import MangaChapterRepository from '@src/repositories/manga-chapter.repository';
import MangaRepository from '@src/repositories/manga.repository';
import TagRepository from '@src/repositories/tag.repository';
import AuthorRepository from '@src/repositories/author.repository';
import { MangaChapter, MangaChapterImage } from '@src/schemas/manga-chapter.schema';
import MangaChapterBusiness from './manga-chapter.business';

interface IPreviewMangaDetail {
    name: PropType<Manga, 'name'>;
    otherName: PropType<Manga, 'otherName'>;
    slug: PropType<Manga, 'slug'>;
    imagePreview: PropType<Manga, 'imagePreview'>;
    description: PropType<Manga, 'description'>;
    status: PropType<Manga, 'status'>;
    author: {
        name: PropType<Author, 'name'>;
        slug: PropType<Author, 'slug'>;
    };
    tags: string[];
}

interface IChapterListDetail {
    chapterNumber: number;
    chapterUrl: string;
}

@Injectable()
class MangaDetailBusiness {
    private readonly logger = new Logger(MangaDetailBusiness.name);
    protected mangaDetailUrl: string;

    constructor(
        private mangaChapterBusiness: MangaChapterBusiness,
        private crawlService: CrawlService,
        private mangaRepository: MangaRepository,
        private mangaChapterRepository: MangaChapterRepository,
        private tagRepository: TagRepository,
        private authorRepository: AuthorRepository,
    ) {}

    async execute(mangaDetailUrl: string): Promise<boolean> {
        this.mangaDetailUrl = mangaDetailUrl;
        let isContinue = true;
        try {
            this.logger.log(`Get manga detail, url: ${this.mangaDetailUrl}`);
            const $ = await this.crawlService.getContent(this.mangaDetailUrl);
            if (!$) {
                this.logger.error(`Error HTML from: ${this.mangaDetailUrl}`);
                return isContinue;
            }
            const previewMangaData = await this.getPreviewMangaDetail($);
            const manga = await this.createMangaDetail(previewMangaData);
            if (!!manga) {
                const mangaChapters = await this.mangaChapterRepository.findChaptersByManga(manga);
                const mangaChapterNumbers: number[] = mangaChapters.map(mangaChapter => mangaChapter.number);
                const chapterListDetail = this.crawlMangaChapterList($, mangaChapterNumbers);
                if (!!chapterListDetail && chapterListDetail.length > 0) {
                    manga.publishedAt = new Date();
                    await Promise.all([this.createMangaChapterList(manga, chapterListDetail), manga.save()]);
                } else {
                    this.logger.log(`Alr latest manga`);
                    isContinue = false;
                }
            }
            this.logger.log(`End get detail manga: ${this.mangaDetailUrl}`);
            return isContinue;
        } catch (e) {
            this.logger.error(`Cannot get detail manga: ${this.mangaDetailUrl}`);
            this.logger.error(e);
            return isContinue;
        }
    }

    private async getPreviewMangaDetail($: cheerio.Root): Promise<IPreviewMangaDetail> {
        const mangaName: string = $('.block01 .center h1')
            .text()
            .trim();
        const mangaSlug: string = slug(mangaName);
        const authorName: string = $('.block01 .center p.info-item .org')
            .text()
            .trim();
        const description: string = $('.block01 .center .story-detail-info p')
            .text()
            .trim();

        const imagePreview: string = await this.getMangaPreviewImage($, mangaSlug);

        return {
            name: mangaName,
            otherName: this.getMangaOtherName($),
            slug: mangaSlug,
            imagePreview: imagePreview,
            description: description,
            author: {
                name: authorName,
                slug: slug(authorName),
            },
            tags: this.getMangaTas($),
            status: this.getMangaStatus($),
        };
    }

    /**
     * Create manga detail
     * @param mangaDetailData
     * @return IMangaDocument | null
     */
    async createMangaDetail(mangaDetailData: IPreviewMangaDetail): Promise<Manga | null> {
        let manga: Manga | null = null;

        // Insert or update authors
        const author: Author | null = await this.authorRepository.findOneAndUpdate(
            { slug: mangaDetailData.author.slug },
            {
                name: mangaDetailData.author.name,
            },
            { new: true, upsert: true, setDefaultsOnInsert: true },
        );

        // Insert or update tags
        const tags: Tag[] = await this.tagRepository.find({
            slug: { $in: mangaDetailData.tags },
        });

        if (!!author) {
            manga = await this.mangaRepository.findOneAndUpdate(
                { slug: mangaDetailData.slug, author: author._id },
                {
                    name: mangaDetailData.name,
                    otherName: mangaDetailData.otherName,
                    slug: mangaDetailData.slug,
                    imagePreview: mangaDetailData.imagePreview,
                    description: mangaDetailData.description,
                    status: mangaDetailData.status,
                    publishedAt: new Date(),
                    $addToSet: {
                        tags: {
                            $each: tags,
                        },
                    },
                },
                { new: true, upsert: true, setDefaultsOnInsert: true },
            );
        }

        return manga;
    }

    getMangaOtherName($: cheerio.Root): string {
        return $('.block01 .center span.info-item')
            .text()
            .replace('Tên Khác:', '')
            .trim();
    }

    async getMangaPreviewImage($: cheerio.Root, mangaSlug: string): Promise<string> {
        const rootPath: string = path.join(__dirname, '../../../', 'public/');
        const filePath = `/public/mangas/${mangaSlug}/`;
        const fullPath = `${rootPath}${filePath}`;
        try {
            let imagePreview: string = $('.block01 .left img').attr('src')!;
            const fileName = `preview.jpg`;
            if (!!imagePreview && !fileExists(`${fullPath}${fileName}`)) {
                await mkdir(fullPath);
                imagePreview = await this.crawlService.downloadFromUrl(
                    this.mangaDetailUrl,
                    imagePreview,
                    fullPath,
                    fileName,
                );
            }

            return !!imagePreview ? `${filePath}${fileName}` : '';
        } catch (e) {
            await rmDir(fullPath);
            this.logger.error(`Cannot get preview image`);
            this.logger.error(e);
            return '';
        }
    }

    /**
     * Get manga tags
     * @param $
     * @return ITagDetail[]
     */
    getMangaTas($: cheerio.Root): string[] {
        const tags: string[] = [];
        let tagName: string;
        $('.block01 .center .list01 a').each((_idx: number, ele: cheerio.Element) => {
            tagName = $(ele)
                .text()
                .trim();
            tags.push(slug(tagName));
        });

        return tags;
    }

    /**
     * Get Manga status
     * @param $
     * @return MANGA_STATUS
     */
    getMangaStatus($: cheerio.Root): MANGA_STATUS {
        const status: string = $('.block01 .center .info-item')
            .text()
            .trim();
        if (status.includes('Đang Cập Nhật')) {
            return MANGA_STATUS.CONTINUE;
        }
        return MANGA_STATUS.COMPLETE;
    }

    crawlMangaChapterList($: cheerio.Root, mangaChapterNumbers: number[]): IChapterListDetail[] {
        let chapterNumber: number | null;
        let chapterUrl: string;
        const mangaChapterList: IChapterListDetail[] = [];

        $(
            $('.block02 .works-chapter-list a')
                .get()
                .reverse(),
        ).each((_idx: number, ele: cheerio.Element) => {
            chapterNumber = this.getChapterNumberData($(ele).text());
            chapterUrl = $(ele).attr('href')!;
            if (
                !!chapterNumber &&
                !!chapterUrl &&
                !mangaChapterNumbers.includes(chapterNumber) &&
                mangaChapterList.length < 5
            ) {
                mangaChapterList.push({
                    chapterNumber,
                    chapterUrl,
                });
            }
        });

        return mangaChapterList;
    }

    async createMangaChapterList(manga: Manga, chapterListDetail: IChapterListDetail[]): Promise<void> {
        for (const chapterDetail of chapterListDetail) {
            await this.createMangaChapter(manga, chapterDetail.chapterNumber, chapterDetail.chapterUrl);
        }
    }

    /**
     * Create manga chapter
     *
     * @param manga
     * @param chapterNumber
     * @param chapterUrl
     */
    async createMangaChapter(manga: Manga, chapterNumber: number, chapterUrl: string): Promise<MangaChapter | null> {
        // Execute every chapter
        const chapterImages: MangaChapterImage[] = await this.mangaChapterBusiness.execute(
            manga,
            chapterNumber,
            chapterUrl,
        );
        let mangaChapter: MangaChapter | null = null;
        if (chapterImages.length > 0) {
            mangaChapter = await this.mangaChapterRepository.findOneAndUpdate(
                { number: chapterNumber, manga: manga },
                {
                    manga: manga,
                    publishedAt: new Date(),
                    $addToSet: {
                        images: { $each: chapterImages },
                    },
                },
                { new: true, upsert: true, setDefaultsOnInsert: true },
            );
        }

        return mangaChapter;
    }

    /**
     * Get chapter number
     * @param chapterNumberName
     * @return number | null
     */
    getChapterNumberData(chapterNumberName: string): number | null {
        try {
            const regExpArr: RegExpMatchArray | null = chapterNumberName.match(/\d+\.\d+|\d+\b|\d+(?=\w)/g);
            if (!!regExpArr && !!regExpArr[0]) {
                return parseFloat(regExpArr[0]);
            } else {
                return null;
            }
        } catch (e) {
            return null;
        }
    }
}

export default MangaDetailBusiness;
