import { Module } from '@nestjs/common';
import { AccessModule } from '../access/access.module';
import { ClinicalHistoryModule } from '../clinical-history/clinical-history.module';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { NoStoreInterceptor } from './no-store.interceptor';

@Module({
  imports: [AccessModule, ClinicalHistoryModule],
  controllers: [ClientController],
  providers: [ClientService, NoStoreInterceptor],
  exports: [ClientService],
})
export class ClientModule {}
