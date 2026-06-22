import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class UpdateExpenseDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  spentAmount?: number;

  @IsOptional()
  @IsIn(['fixed', 'variable'])
  type?: string;

  @IsOptional()
  @IsInt()
  sacrificePriority?: number;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'referenceDate deve estar no formato YYYY-MM-DD',
  })
  referenceDate?: string;
}
