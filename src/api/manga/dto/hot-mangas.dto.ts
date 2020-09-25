import { IsNumberString, IsOptional } from 'class-validator';

export class HotMangasDto {
    @IsOptional()
    @IsNumberString()
    limit: number;
}
