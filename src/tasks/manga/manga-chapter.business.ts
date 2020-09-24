import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import { Manga } from '@src/schemas/manga.schema';
import { MangaChapterImage } from '@src/schemas/manga-chapter.schema';
import { CrawlService } from '@src/common/crawl/crawl.service';
import { generateToken, mkdir, rmDir } from '@src/helpers/utils';

@Injectable()
class MangaChapterBusiness {
    private readonly logger = new Logger(MangaChapterBusiness.name);
    protected manga: Manga;
    protected chapterNumber: number;
    protected mangaChapterUrl: string;
    private counter = 1;
    constructor(private crawlService: CrawlService) {}

    async execute(manga: Manga, chapterNumber: number, mangaChapterUrl: string): Promise<MangaChapterImage[]> {
        this.manga = manga;
        this.chapterNumber = chapterNumber;
        this.mangaChapterUrl = mangaChapterUrl;
        try {
            this.logger.log(`Get manga chapter, url: ${this.mangaChapterUrl}`);
            const mangaChapter: MangaChapterImage[] = await this.getMangaChapter();
            this.logger.log(`End get tried ${this.counter} times chapter manga: ${this.mangaChapterUrl}`);

            return mangaChapter;
        } catch (e) {
            this.logger.error(`Error get chapter manga: ${this.mangaChapterUrl}`);
            this.logger.error(e);

            return [];
        }
    }

    async getMangaChapter(): Promise<MangaChapterImage[]> {
        if (this.counter > 5) {
            this.logger.error(`End err chapter manga: ${this.mangaChapterUrl}, tried ${this.counter}`);
            return [];
        }

        const $ = await this.crawlService.getContent(this.mangaChapterUrl);
        if (!$) {
            this.logger.error(`Error get html: ${this.mangaChapterUrl}`);
            return [];
        }
        let dataImages: MangaChapterImage[] | null = this.getChapterImages($);
        if (!!dataImages && dataImages.length > 0) {
            dataImages = await this.processChaptersDataDownloadImage(this.manga, dataImages);
            if (!!dataImages && dataImages.length > 0) {
                return dataImages;
            } else {
                this.counter++;
                return this.getMangaChapter();
            }
        }

        return [];
    }

    /**
     * Get chapter images
     * @param $
     */
    getChapterImages($: cheerio.Root): MangaChapterImage[] {
        const dataImages: MangaChapterImage[] = [];
        let imageUrl: string | undefined;
        $('.story-see-main .story-see-content img.lazy').each((idx: number, ele: cheerio.Element) => {
            imageUrl = $(ele).attr('src');
            if (!imageUrl) {
                imageUrl = $(ele).attr('data-original');
            }
            if (!!imageUrl && dataImages.length < 4) {
                dataImages.push({
                    order: idx,
                    imageUrl,
                });
            }
        });

        return dataImages;
    }

    async processChaptersDataDownloadImage(
        manga: Manga,
        dataImages: MangaChapterImage[],
    ): Promise<MangaChapterImage[] | null> {
        const rootPath: string = path.join(__dirname, '../../../', 'public/');
        const mangaSlug: string = manga.slug;
        const filePath = `/public/mangas/${mangaSlug}/${this.chapterNumber}/`;
        const fullPath = `${rootPath}${filePath}`;
        try {
            await mkdir(fullPath);
            return await Promise.all(
                dataImages.map(
                    async (dataImage): Promise<MangaChapterImage> => {
                        const fileName = `${generateToken()}.jpg`;
                        const fullFileName = await this.crawlService.downloadFromUrl(
                            this.mangaChapterUrl,
                            dataImage.imageUrl,
                            fullPath,
                            fileName,
                        );

                        if (!!fullFileName) {
                            return {
                                ...dataImage,
                                imageUrl: filePath + fileName,
                            };
                        }

                        return dataImage;
                    },
                ),
            );
        } catch (e) {
            await rmDir(fullPath);
            this.logger.error(`Error download from url: ${this.mangaChapterUrl}`);
            this.logger.error(e);
            return null;
        }
    }
}

export default MangaChapterBusiness;
