import { Controller, Get, Param, Query, Headers, UseGuards, Put } from '@nestjs/common';
import { Paginate } from '@src/helpers/typeHelper';
import { Manga, MANGA_SORT_TYPE, MANGA_STATUS } from '@src/schemas/manga.schema';
import MangaBusiness from '@src/business/api/manga.business';
import { LatestMangasDto } from '@src/api/manga/dto/latest-mangas.dto';
import { positiveVal, stringToArray } from '@src/helpers/utils';
import { SearchMangasDto } from '@src/api/manga/dto/search-mangas.dto';
import { TopMangasDto } from '@src/api/manga/dto/top-mangas.dto';
import { AccessCountGuard } from '@src/guards/AccessCountGuard';
import { HotMangasDto } from '@src/api/manga/dto/hot-mangas.dto';

@Controller('api/manga')
export class MangaController {
    constructor(private mangaBusiness: MangaBusiness) {}
    @Get()
    async getLatestMangas(@Query() latestMangaDto: LatestMangasDto) {
        const mangasPaginate: Paginate<Manga> = await this.mangaBusiness.getListPaginate(
            positiveVal(latestMangaDto.page),
            positiveVal(latestMangaDto.limit),
        );

        return { data: mangasPaginate, message: 'Get list latest manga' };
    }

    @Get('hot-mangas')
    async getHotMangas(@Query() hotMangasDto: HotMangasDto) {
        const mangas = await this.mangaBusiness.getHotMangas(hotMangasDto.limit);

        return { data: mangas, message: 'Get top mangas' };
    }

    @Get('top-mangas')
    async getTopMangas(@Query() topMangasDto: TopMangasDto) {
        const mangas = await this.mangaBusiness.getTopMangas(topMangasDto['date-sort']);

        return { data: mangas, message: 'Get top mangas' };
    }

    @Get('search-mangas')
    async searchMangas(@Query() searchMangaDto: SearchMangasDto) {
        const page: number = positiveVal(searchMangaDto.page);
        const perPage: number = positiveVal(searchMangaDto.limit);
        const status: MANGA_STATUS = <MANGA_STATUS>searchMangaDto.status;
        const sort: MANGA_SORT_TYPE = <MANGA_SORT_TYPE>searchMangaDto.sort;
        const tags: string[] = stringToArray(searchMangaDto.tags);

        const mangas = await this.mangaBusiness.searchMangas(page, perPage, status, sort, tags);

        return { data: mangas, message: 'Search mangas' };
    }

    @Get(':slug')
    async showMangaDetail(@Param() { slug }: { slug: string }) {
        const manga: Manga | null = await this.mangaBusiness.getMangaDetail(slug);

        return { data: manga, message: 'Show manga detail' };
    }

    @Put(':slug/like')
    async likeManga(@Param() { slug }: { slug: string }) {
        await this.mangaBusiness.likeManga(slug);
        return { data: true, message: 'Like successful' };
    }

    @Put(':slug/follow')
    async followManga(@Param() { slug }: { slug: string }) {
        await this.mangaBusiness.followManga(slug);
        return { data: true, message: 'Follow successful' };
    }

    @Get(':slug/:chapter')
    @UseGuards(AccessCountGuard)
    async showChapterDetail(
        @Param() { slug, chapter }: { slug: string; chapter: number },
        @Headers('access-count-token') accessCountToken: string,
    ) {
        const manga: Manga | null = await this.mangaBusiness.showChapterDetail(slug, chapter, accessCountToken);

        return { data: manga, message: 'Show manga chapter detail' };
    }
}
