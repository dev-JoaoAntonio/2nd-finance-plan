import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2, { message: 'O nome precisa ter pelo menos 2 caracteres.' })
  @MaxLength(120)
  name: string;

  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'A senha precisa ter pelo menos 6 caracteres.' })
  @MaxLength(72)
  password: string;
}
