import { Injectable, Logger } from '@nestjs/common';
import {
  EmailProvider,
  SendEmailParams,
  SendEmailResult,
} from '../interfaces/email-provider.interface';

@Injectable()
export class FakeEmailProvider implements EmailProvider {
  private readonly logger = new Logger(FakeEmailProvider.name);

  async sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
    this.logger.log(`[FakeEmail] Sending "${params.subject}" to ${params.to}`);
    const providerRef = `email_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return { providerRef };
  }
}

