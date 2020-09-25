import { IsNumberString, IsOptional } from 'class-validator';

export class LatestMangasDto {
    @IsOptional()
    @IsNumberString()
    page: number;

    @IsOptional()
    @IsNumberString()
    limit: number;
}
