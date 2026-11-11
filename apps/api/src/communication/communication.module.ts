import { Module } from '@nestjs/common';
import { CommunicationController } from './communication.controller';
import { CommunicationService } from './communication.service';
import { CommunicationQueueService } from './communication-queue.service';
import { WHATSAPP_PROVIDER } from './interfaces/whatsapp-provider.interface';
import { FakeWhatsAppProvider } from './providers/fake-whatsapp.provider';
import { EMAIL_PROVIDER } from './interfaces/email-provider.interface';
import { FakeEmailProvider } from './providers/fake-email.provider';

@Module({
  controllers: [CommunicationController],
  providers: [
    CommunicationService,
    CommunicationQueueService,
    {
      provide: WHATSAPP_PROVIDER,
      useClass: FakeWhatsAppProvider,
    },
    {
      provide: EMAIL_PROVIDER,
      useClass: FakeEmailProvider,
    },
  ],
  exports: [CommunicationService, CommunicationQueueService],
})
export class CommunicationModule {}

