import { Controller, Get, Param, Query, Headers, UseGuards, Put, Body, Delete } from '@nestjs/common';
import { Paginate } from '@src/helpers/typeHelper';
import { Manga, MANGA_SORT_TYPE, MANGA_STATUS } from '@src/schemas/manga.schema';
import MangaBusiness from '@src/business/api/manga.business';
import { LatestMangasDto } from '@src/api/manga/dto/latest-mangas.dto';
import { positiveVal, stringToArray } from '@src/helpers/utils';
import { SearchMangasDto } from '@src/api/manga/dto/search-mangas.dto';
import { TopMangasDto } from '@src/api/manga/dto/top-mangas.dto';
import { AccessCountGuard } from '@src/guards/AccessCountGuard';
import { HotMangasDto } from '@src/api/manga/dto/hot-mangas.dto';
import { FollowMangasDto } from '@src/api/manga/dto/follow-mangas.dto';

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

    @Get('follow-mangas')
    @UseGuards(AccessCountGuard)
    async getFollowMangas(
        @Query() followMangasDto: FollowMangasDto,
        @Headers('access-count-token') accessCountToken: string,
    ) {
        const mangasPaginate: Paginate<Manga> = await this.mangaBusiness.getFollowMangas(
            positiveVal(followMangasDto.page),
            positiveVal(followMangasDto.limit),
            accessCountToken,
        );

        return { data: mangasPaginate, message: 'Get list follow manga' };
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
    @UseGuards(AccessCountGuard)
    async showMangaDetail(
        @Param() { slug }: { slug: string },
        @Headers('access-count-token') accessCountToken: string,
    ) {
        const manga: Manga | null = await this.mangaBusiness.getMangaDetail(slug, accessCountToken);
        return { data: manga, message: 'Show manga detail' };
    }

    @Put(':slug/like')
    @UseGuards(AccessCountGuard)
    async likeManga(@Param() { slug }: { slug: string }, @Headers('access-count-token') accessCountToken: string) {
        const liked = await this.mangaBusiness.likeManga(slug, accessCountToken);
        return { data: liked, message: 'Like successful' };
    }

    @Put(':slug/follow')
    @UseGuards(AccessCountGuard)
    async followManga(@Param() { slug }: { slug: string }, @Headers('access-count-token') accessCountToken: string) {
        const followed = await this.mangaBusiness.followManga(slug, accessCountToken);
        return { data: followed, message: 'Follow successful' };
    }

    @Delete(':slug/follow')
    @UseGuards(AccessCountGuard)
    async unFollowManga(@Param() { slug }: { slug: string }, @Headers('access-count-token') accessCountToken: string) {
        const unFollowed = await this.mangaBusiness.unFollowManga(slug, accessCountToken);
        return { data: unFollowed, message: 'Unfollow successful' };
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
