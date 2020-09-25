import { Injectable } from '@nestjs/common';
import { DocumentQuery, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Manga } from '@src/schemas/manga.schema';
import { MangaChapter } from '@src/schemas/manga-chapter.schema';
import BaseRepository from './base.repository';

@Injectable()
class MangaChapterRepository extends BaseRepository<MangaChapter> {
    @InjectModel(MangaChapter.name) protected model: Model<MangaChapter>;
    @InjectModel(Manga.name) protected mangaModel: Model<Manga>;

    findChaptersByManga(manga: Manga, limit?: number): DocumentQuery<MangaChapter[], MangaChapter> {
        let query: DocumentQuery<MangaChapter[], MangaChapter> = this.find({
            manga: manga._id,
        })
            .select('number viewCount publishedAt')
            .sort({ number: 'desc' });
        if (limit) {
            query = query.limit(limit);
        }

        return query;
    }

    findOneChapterByManga(manga: Manga, chapterNumber: number) {
        return this.findOne({
            manga: manga._id,
            number: chapterNumber,
        })
            .select('-__v')
            .sort({ number: 'desc' });
    }

    setImagesPath(mangaChapter: MangaChapter, uploadBaseUrl: string) {
        mangaChapter.get('images').map(image => {
            image.imageUrl = `${uploadBaseUrl}${image.imageUrl}`;
            return image;
        });

        return mangaChapter;
    }
}

export default MangaChapterRepository;
