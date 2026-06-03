import { IsOptional, IsString, Matches, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class MonthQueryDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'Use o formato AAAA-MM.' })
  month?: string;
}

export class TrendQueryDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'Use o formato AAAA-MM.' })
  month?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24)
  months?: number = 6;
}
