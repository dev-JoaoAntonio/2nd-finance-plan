import { IsOptional, IsString, Matches, IsUUID } from 'class-validator';

export class QueryExpenseDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'Use o formato AAAA-MM.' })
  month?: string;

  @IsOptional()
  @IsUUID('4')
  categoryId?: string;
}
