import { Controller, Get, Req, Request } from '@nestjs/common';

@Controller('manga')
export class MangaController {
    @Get()
    getAllPaginate(@Req() req: Request): string {
        return 'This action returns all cats';
    }
}
