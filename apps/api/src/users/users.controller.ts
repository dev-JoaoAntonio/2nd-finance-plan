import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { RequestUser } from '../auth/jwt.strategy';

@Controller()
@UseGuards(JwtAuthGuard)
export class UsersController {
  @Get('me')
  me(@CurrentUser() user: RequestUser) {
    return user;
  }
}
