import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import BaseRepository from './base.repository';
import { ChapterView } from '@src/schemas/chapter-view.schema';

@Injectable()
class ChapterViewRepository extends BaseRepository<ChapterView> {
    @InjectModel(ChapterView.name) protected model: Model<ChapterView>;
}

export default ChapterViewRepository;
