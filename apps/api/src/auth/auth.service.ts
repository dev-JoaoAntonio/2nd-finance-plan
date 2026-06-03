import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CategorizationService } from '../categorization/categorization.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly categorization: CategorizationService,
  ) {}

  async register(dto: RegisterDto): Promise<{ token: string; user: AuthUser }> {
    const email = dto.email.toLowerCase().trim();

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Já existe uma conta com este e-mail.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { name: dto.name.trim(), email, passwordHash },
    });

    // Semeia categorias + regras padrão para o novo usuário.
    await this.categorization.seedDefaults(user.id);

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<{ token: string; user: AuthUser }> {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: {
    id: string;
    name: string;
    email: string;
  }): { token: string; user: AuthUser } {
    const payload = { sub: user.id, email: user.email };
    const token = this.jwt.sign(payload);
    return {
      token,
      user: { id: user.id, name: user.name, email: user.email },
    };
  }
}
