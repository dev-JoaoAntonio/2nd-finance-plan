import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

const HEX = /^#?[0-9a-fA-F]{6}$/;

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  @Matches(HEX, { message: 'color deve ser um hex (#RRGGBB)' })
  color?: string;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(HEX, { message: 'color deve ser um hex (#RRGGBB)' })
  color?: string;
}
