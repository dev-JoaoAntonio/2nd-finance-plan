import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { UpsertContributionDto } from './dto/upsert-contribution.dto';

@Controller('goals')
export class GoalsController {
  constructor(private readonly goals: GoalsService) {}

  @Get()
  findAll() {
    return this.goals.findAll();
  }

  @Post()
  create(@Body() dto: CreateGoalDto) {
    return this.goals.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGoalDto) {
    return this.goals.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.goals.remove(id);
  }

  @Get(':id/contributions')
  listContributions(@Param('id') id: string) {
    return this.goals.listContributions(id);
  }

  @Put(':id/contributions')
  upsertContribution(
    @Param('id') id: string,
    @Body() dto: UpsertContributionDto,
  ) {
    return this.goals.upsertContribution(id, dto);
  }

  @Delete(':id/contributions/:referenceDate')
  deleteContribution(
    @Param('id') id: string,
    @Param('referenceDate') referenceDate: string,
  ) {
    return this.goals.deleteContribution(id, referenceDate);
  }
}
