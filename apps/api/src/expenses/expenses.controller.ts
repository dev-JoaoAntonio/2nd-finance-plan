import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { RequestUser } from '../auth/jwt.strategy';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expenses: ExpensesService) {}

  @Get()
  findAll(@CurrentUser() user: RequestUser, @Query() query: QueryExpenseDto) {
    return this.expenses.findAll(user.id, query);
  }

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateExpenseDto) {
    return this.expenses.create(user.id, dto);
  }

  @Post('recategorize')
  @HttpCode(HttpStatus.OK)
  recategorize(@CurrentUser() user: RequestUser) {
    return this.expenses.recategorize(user.id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.expenses.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.expenses.remove(user.id, id);
  }
}
