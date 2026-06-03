import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { RequestUser } from '../auth/jwt.strategy';
import { AnalyticsService } from './analytics.service';
import { MonthQueryDto, TrendQueryDto } from './dto/analytics-query.dto';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get('summary')
  summary(@CurrentUser() user: RequestUser, @Query() q: MonthQueryDto) {
    return this.analytics.summary(user.id, q.month);
  }

  @Get('by-category')
  byCategory(@CurrentUser() user: RequestUser, @Query() q: MonthQueryDto) {
    return this.analytics.byCategory(user.id, q.month);
  }

  @Get('monthly-trend')
  monthlyTrend(@CurrentUser() user: RequestUser, @Query() q: TrendQueryDto) {
    return this.analytics.monthlyTrend(user.id, q.month, q.months ?? 6);
  }
}
