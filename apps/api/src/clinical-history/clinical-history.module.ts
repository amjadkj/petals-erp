import { Module } from '@nestjs/common';
import { VersionService } from './version.service';
import { ClinicalHistoryController } from './clinical-history.controller';

@Module({
  controllers: [ClinicalHistoryController],
  providers: [VersionService],
  exports: [VersionService],
})
export class ClinicalHistoryModule {}

