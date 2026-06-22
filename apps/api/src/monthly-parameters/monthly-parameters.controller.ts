import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { MonthlyParametersService } from './monthly-parameters.service';
import { UpsertMonthlyParameterDto } from './dto/upsert-monthly-parameter.dto';
import {
  CreateIncomeSourceDto,
  UpdateIncomeSourceDto,
} from './dto/income-source.dto';

@Controller('monthly-parameters')
export class MonthlyParametersController {
  constructor(private readonly service: MonthlyParametersService) {}

  @Get('latest-month')
  latestMonth() {
    return this.service.latestMonth();
  }

  @Get('income-sources')
  listIncomeSources(@Query('referenceDate') referenceDate: string) {
    return this.service.listIncomeSources(referenceDate);
  }

  @Post('income-sources')
  createIncomeSource(@Body() dto: CreateIncomeSourceDto) {
    return this.service.createIncomeSource(dto);
  }

  @Patch('income-sources/:id')
  updateIncomeSource(
    @Param('id') id: string,
    @Body() dto: UpdateIncomeSourceDto,
  ) {
    return this.service.updateIncomeSource(id, dto);
  }

  @Delete('income-sources/:id')
  deleteIncomeSource(@Param('id') id: string) {
    return this.service.deleteIncomeSource(id);
  }

  @Get()
  findOne(@Query('referenceDate') referenceDate: string) {
    return this.service.findOne(referenceDate);
  }

  @Put()
  upsert(@Body() dto: UpsertMonthlyParameterDto) {
    return this.service.upsert(dto);
  }
}
