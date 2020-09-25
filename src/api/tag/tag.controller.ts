import { Controller, Get } from '@nestjs/common';
import TagBusiness from '@src/business/api/tag.business';

@Controller('api/tag')
export class TagController {
    constructor(private tagBusiness: TagBusiness) {}
    @Get()
    async getAll() {
        const tags = await this.tagBusiness.getAll();

        return { data: tags, message: 'Get tags' };
    }
}
