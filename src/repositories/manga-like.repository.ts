import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import BaseRepository from './base.repository';
import { MangaLike } from '@src/schemas/manga-like.schema';

@Injectable()
class MangaLikeRepository extends BaseRepository<MangaLike> {
    @InjectModel(MangaLike.name) protected model: Model<MangaLike>;
}

export default MangaLikeRepository;
