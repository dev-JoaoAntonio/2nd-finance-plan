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

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  spentAmount?: number;

  @IsIn(['fixed', 'variable'])
  type: string;

  @IsOptional()
  @IsInt()
  sacrificePriority?: number;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'referenceDate deve estar no formato YYYY-MM-DD',
  })
  referenceDate: string;
}
