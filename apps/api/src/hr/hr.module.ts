import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { HrController } from './hr.controller';
import { HrService } from './hr.service';

@Module({
  imports: [CommonModule],
  controllers: [HrController],
  providers: [HrService],
  exports: [HrService],
})
export class HrModule {}

