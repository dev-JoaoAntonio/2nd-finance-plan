import { PartialType } from '@nestjs/mapped-types';
import { CreateIncomeDto } from './create-income.dto';

// Atualização parcial: mesmos campos do create, todos opcionais. Quando enviados,
// continuam validados (valor > 0, origem não vazia).
export class UpdateIncomeDto extends PartialType(CreateIncomeDto) {}
