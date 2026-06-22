import { IsDateString, IsNumber, Min } from 'class-validator';

export class UpsertContributionDto {
  @IsDateString()
  referenceDate: string;

  @IsNumber()
  @Min(0)
  amount: number;
}
