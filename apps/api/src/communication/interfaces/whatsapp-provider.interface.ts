import { MessageStatus } from '@petals/types';

export interface SendWhatsAppParams {
  to: string;
  templateName: string;
  language?: string;
  parameters?: Record<string, string>;
}

export interface SendWhatsAppResult {
  providerRef: string;
  status: MessageStatus;
}

export interface WhatsAppProvider {
  sendMessage(params: SendWhatsAppParams): Promise<SendWhatsAppResult>;
  verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean;
}

export const WHATSAPP_PROVIDER = Symbol('WHATSAPP_PROVIDER');

