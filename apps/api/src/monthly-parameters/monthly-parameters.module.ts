import { Module } from '@nestjs/common';
import { MonthlyParametersController } from './monthly-parameters.controller';
import { MonthlyParametersService } from './monthly-parameters.service';

@Module({
  controllers: [MonthlyParametersController],
  providers: [MonthlyParametersService],
})
export class MonthlyParametersModule {}
