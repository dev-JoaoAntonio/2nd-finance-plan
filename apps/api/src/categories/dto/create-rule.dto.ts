import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateRuleDto {
  @IsString()
  @MinLength(2, { message: 'A palavra-chave precisa ter pelo menos 2 letras.' })
  @MaxLength(60)
  keyword: string;
}
