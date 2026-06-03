import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { RequestUser } from '../auth/jwt.strategy';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateRuleDto } from './dto/create-rule.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get('categories')
  findAll(@CurrentUser() user: RequestUser) {
    return this.categories.findAll(user.id);
  }

  @Post('categories')
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateCategoryDto) {
    return this.categories.create(user.id, dto);
  }

  @Patch('categories/:id')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categories.update(user.id, id, dto);
  }

  @Delete('categories/:id')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.categories.remove(user.id, id);
  }

  @Post('categories/:id/rules')
  addRule(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: CreateRuleDto,
  ) {
    return this.categories.addRule(user.id, id, dto);
  }

  @Delete('rules/:ruleId')
  removeRule(
    @CurrentUser() user: RequestUser,
    @Param('ruleId') ruleId: string,
  ) {
    return this.categories.removeRule(user.id, ruleId);
  }
}
