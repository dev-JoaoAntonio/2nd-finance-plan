import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsBoolean } from 'class-validator';
import { CreateExpenseDto } from './create-expense.dto';

export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {
  /**
   * Quando true, remove a categoria (deixa "sem categoria"). Útil porque um
   * PATCH com categoryId ausente não consegue distinguir "não mexer" de "limpar".
   */
  @IsOptional()
  @IsBoolean()
  clearCategory?: boolean;
}
