import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import BaseRepository from './base.repository';
import { Tag } from '@src/schemas/tag.schema';

@Injectable()
class TagRepository extends BaseRepository<Tag> {
    @InjectModel(Tag.name) protected model: Model<Tag>;
}

export default TagRepository;
