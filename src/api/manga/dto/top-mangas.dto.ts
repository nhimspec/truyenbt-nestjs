import { DATE_SORT } from '@src/common/constants';
import { IsIn, IsOptional } from 'class-validator';

export class TopMangasDto {
    @IsOptional()
    @IsIn([DATE_SORT.WEEK, DATE_SORT.MONTH, DATE_SORT.YEAR])
    'date-sort': DATE_SORT;
}
