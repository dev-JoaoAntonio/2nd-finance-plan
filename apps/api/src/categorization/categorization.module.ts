import { Global, Module } from '@nestjs/common';
import { CategorizationService } from './categorization.service';

@Global()
@Module({
  providers: [CategorizationService],
  exports: [CategorizationService],
})
export class CategorizationModule {}
