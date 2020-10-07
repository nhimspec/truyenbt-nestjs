import { MANGA_SORT_TYPE, MANGA_STATUS } from '@src/schemas/manga.schema';
import { IsIn, IsNumberString, IsOptional } from 'class-validator';

export class SearchMangasDto {
    @IsOptional()
    @IsNumberString()
    page: number;

    @IsOptional()
    @IsNumberString()
    limit: number;

    @IsOptional()
    @IsIn([MANGA_STATUS.COMPLETE, MANGA_STATUS.CONTINUE])
    status: MANGA_STATUS;

    @IsOptional()
    keyword: string;

    @IsOptional()
    @IsIn([
        MANGA_SORT_TYPE.BY_CREATED,
        MANGA_SORT_TYPE.BY_TOP_ALL,
        MANGA_SORT_TYPE.BY_TOP_YEAR,
        MANGA_SORT_TYPE.BY_TOP_MONTH,
        MANGA_SORT_TYPE.BY_TOP_WEEK,
    ])
    sort: MANGA_SORT_TYPE;

    @IsOptional()
    tags: string | string[];
}
