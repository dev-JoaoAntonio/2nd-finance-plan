import { IsNumber, Matches, Min } from 'class-validator';

export class UpsertMonthlyParameterDto {
  @IsNumber()
  @Min(0)
  baseIncome: number;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'referenceDate deve estar no formato YYYY-MM-DD',
  })
  referenceDate: string;
}
