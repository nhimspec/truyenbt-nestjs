import { Injectable } from '@nestjs/common';
import { Tag } from '@src/schemas/tag.schema';
import TagRepository from '@src/repositories/tag.repository';

@Injectable()
export default class TagBusiness {
    constructor(private tagRepository: TagRepository) {}

    /**
     * Get all Tags
     */
    async getAll(): Promise<Tag[]> {
        return this.tagRepository
            .find({})
            .select('-__v')
            .sort({ name: 1 });
    }
}
