import { IsOptional, IsString, Matches } from 'class-validator';

export class QueryIncomeDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'Use o formato AAAA-MM.' })
  month?: string;
}
