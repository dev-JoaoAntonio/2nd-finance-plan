import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Min,
} from 'class-validator';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export class CreateTransactionDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsUUID()
  categoryId: string;

  @Matches(DATE_RE, { message: 'occurredAt deve estar no formato YYYY-MM-DD' })
  occurredAt: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateTransactionDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @Matches(DATE_RE, { message: 'occurredAt deve estar no formato YYYY-MM-DD' })
  occurredAt?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
