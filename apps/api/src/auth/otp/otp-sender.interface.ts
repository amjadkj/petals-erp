export const OTP_SENDER = 'OTP_SENDER';

export interface IOtpSender {
  send(target: string, code: string, purpose: string): Promise<void>;
}

/**
 * Default logger-based OTP sender for development/testing.
 * Real SMS/WhatsApp/Email senders will implement this interface.
 */
export class ConsoleOtpSender implements IOtpSender {
  async send(target: string, code: string, purpose: string): Promise<void> {
    // In production this enqueues a BullMQ job
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[OTP Sender] Sent ${purpose} code ${code} to ${target}`);
    }
  }
}

