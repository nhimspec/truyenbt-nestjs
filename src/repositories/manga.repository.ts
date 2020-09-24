import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Manga } from '@src/schemas/manga.schema';
import BaseRepository from './base.repository';

@Injectable()
class MangaRepository extends BaseRepository<Manga> {
    @InjectModel(Manga.name) protected model: Model<Manga>;
}

export default MangaRepository;
