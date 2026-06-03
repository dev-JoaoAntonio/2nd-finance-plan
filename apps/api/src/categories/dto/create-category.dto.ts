import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  name: string;

  @IsString()
  @Matches(/^#([0-9a-fA-F]{6})$/, {
    message: 'A cor deve estar no formato hexadecimal, ex. #0369A1.',
  })
  color: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  icon?: string;
}
