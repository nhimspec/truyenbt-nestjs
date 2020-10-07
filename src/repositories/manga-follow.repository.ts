import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import BaseRepository from './base.repository';
import { MangaFollow } from '@src/schemas/manga-follow.schema';

@Injectable()
class MangaFollowRepository extends BaseRepository<MangaFollow> {
    @InjectModel(MangaFollow.name) protected model: Model<MangaFollow>;
}

export default MangaFollowRepository;
