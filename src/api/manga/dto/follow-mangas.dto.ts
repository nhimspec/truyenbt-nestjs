import { IsNumberString, IsOptional } from 'class-validator';

export class FollowMangasDto {
    @IsOptional()
    @IsNumberString()
    page: number;

    @IsOptional()
    @IsNumberString()
    limit: number;
}
