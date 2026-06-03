import {
  IsString,
  IsNumber,
  IsPositive,
  IsOptional,
  IsDateString,
  IsUUID,
  MaxLength,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExpenseDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Valor inválido.' })
  @IsPositive({ message: 'O valor precisa ser maior que zero.' })
  @Max(1_000_000_000, { message: 'Valor acima do limite permitido.' })
  amount: number;

  @IsString()
  @MaxLength(200)
  description: string;

  @IsDateString({}, { message: 'Data inválida.' })
  date: string;

  @IsOptional()
  @IsUUID('4', { message: 'Categoria inválida.' })
  categoryId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
