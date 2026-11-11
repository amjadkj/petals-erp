import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  SendWhatsAppParams,
  SendWhatsAppResult,
  WhatsAppProvider,
} from '../interfaces/whatsapp-provider.interface';
import { MessageStatus } from '@petals/types';

@Injectable()
export class FakeWhatsAppProvider implements WhatsAppProvider {
  private readonly logger = new Logger(FakeWhatsAppProvider.name);
  private readonly secret = process.env.WHATSAPP_WEBHOOK_SECRET || 'test-webhook-secret';

  async sendMessage(params: SendWhatsAppParams): Promise<SendWhatsAppResult> {
    this.logger.log(
      `[FakeWhatsApp] Sending template "${params.templateName}" to ${params.to}`,
    );
    const providerRef = `wa_msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      providerRef,
      status: MessageStatus.SENT,
    };
  }

  verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean {
    if (!signature) {
      return false;
    }

    if (signature === 'valid-test-signature') {
      return true;
    }

    try {
      const bodyStr = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
      const expectedHash = crypto
        .createHmac('sha256', this.secret)
        .update(bodyStr)
        .digest('hex');

      const cleanSig = signature.startsWith('sha256=')
        ? signature.slice(7)
        : signature;

      return crypto.timingSafeEqual(
        Buffer.from(cleanSig, 'utf8'),
        Buffer.from(expectedHash, 'utf8'),
      );
    } catch {
      return false;
    }
  }
}

