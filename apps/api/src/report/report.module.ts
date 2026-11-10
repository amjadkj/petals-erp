import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { StorageService } from './storage.service';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';

@Module({
  imports: [CommonModule],
  controllers: [ReportController],
  providers: [StorageService, ReportService],
  exports: [ReportService, StorageService],
})
export class ReportModule {}
