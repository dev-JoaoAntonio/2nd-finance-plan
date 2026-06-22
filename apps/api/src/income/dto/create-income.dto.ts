import {
  IsString,
  IsNumber,
  IsPositive,
  IsOptional,
  IsDateString,
  IsNotEmpty,
  MaxLength,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateIncomeDto {
  // Quanto: obrigatório e maior que zero.
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Valor inválido.' })
  @IsPositive({ message: 'O valor precisa ser maior que zero.' })
  @Max(1_000_000_000, { message: 'Valor acima do limite permitido.' })
  amount: number;

  // De onde vem: obrigatório (não pode ser vazio nem só espaços).
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Informe de onde vem o dinheiro.' })
  @IsNotEmpty({ message: 'Informe de onde vem o dinheiro.' })
  @MaxLength(120)
  source: string;

  @IsDateString({}, { message: 'Data inválida.' })
  date: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
