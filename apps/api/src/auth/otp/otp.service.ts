import { Injectable, Inject, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { OtpPurpose } from '@prisma/client';
import { PrismaService } from '../../common/prisma';
import { LockoutService } from '../../common/rate-limit/lockout.service';
import { IOtpSender, OTP_SENDER } from './otp-sender.interface';
import { generateNumericOtp, sha256 } from '../../common/crypto';

const OTP_VALIDITY_SECONDS = 5 * 60; // 5 minutes
const MAX_VERIFY_ATTEMPTS = 5;

@Injectable()
export class OtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly lockoutService: LockoutService,
    @Inject(OTP_SENDER) private readonly otpSender: IOtpSender,
  ) {}

  /**
   * Generates and sends a new OTP code to the target phone/email.
   * Enforces strict rate limits:
   * - 3 requests per 10 min
   * - 10 requests per 24 hours
   * Invalidates any previously active OTPs for this target.
   */
  async requestOtp(target: string, purpose: OtpPurpose = OtpPurpose.LOGIN): Promise<{ message: string; retryAfter?: number }> {
    const cleanTarget = target.trim().toLowerCase();

    // 1. Check 10-minute rate limit (3 attempts)
    const shortTerm = await this.lockoutService.recordFailure(
      cleanTarget,
      `otp_req_short:${purpose}`,
      3,
      10 * 60, // 10 min window
      10 * 60, // 10 min delay
    );
    if (shortTerm.locked) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many OTP requests. Please wait before trying again.',
          error: 'Too Many Requests',
          retryAfter: shortTerm.retryAfterSeconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 2. Check daily rate limit (10 attempts per 24 hours)
    const daily = await this.lockoutService.recordFailure(
      cleanTarget,
      `otp_req_daily:${purpose}`,
      10,
      24 * 60 * 60,
      24 * 60 * 60,
    );
    if (daily.locked) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Daily OTP request limit reached.',
          error: 'Too Many Requests',
          retryAfter: daily.retryAfterSeconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 3. Invalidate previous active OTPs for this target & purpose
    await this.prisma.unscopedClient.otpCode.updateMany({
      where: {
        target: cleanTarget,
        purpose,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    // 4. Generate new OTP and store
    const code = generateNumericOtp();
    const codeHash = sha256(code);
    const expiresAt = new Date(Date.now() + OTP_VALIDITY_SECONDS * 1000);

    await this.prisma.unscopedClient.otpCode.create({
      data: {
        target: cleanTarget,
        purpose,
        codeHash,
        expiresAt,
        attempts: 0,
      },
    });

    // 5. Send code via provider
    await this.otpSender.send(cleanTarget, code, purpose);

    return { message: 'OTP sent successfully' };
  }

  /**
   * Verifies an OTP code.
   * Allows up to 5 attempts per code; on the 5th failed attempt, invalidates the code.
   */
  async verifyOtp(target: string, code: string, purpose: OtpPurpose = OtpPurpose.LOGIN): Promise<boolean> {
    const cleanTarget = target.trim().toLowerCase();
    const now = new Date();

    // Find latest unused, unexpired OTP for this target
    const otpRecord = await this.prisma.unscopedClient.otpCode.findFirst({
      where: {
        target: cleanTarget,
        purpose,
        usedAt: null,
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired OTP code');
    }

    // Check attempts limit
    if (otpRecord.attempts >= MAX_VERIFY_ATTEMPTS) {
      // Invalidate
      await this.prisma.unscopedClient.otpCode.update({
        where: { id: otpRecord.id },
        data: { usedAt: now },
      });
      throw new BadRequestException('Too many failed attempts. This OTP has been invalidated.');
    }

    const inputHash = sha256(code.trim());
    if (inputHash !== otpRecord.codeHash) {
      const nextAttempts = otpRecord.attempts + 1;
      await this.prisma.unscopedClient.otpCode.update({
        where: { id: otpRecord.id },
        data: {
          attempts: nextAttempts,
          ...(nextAttempts >= MAX_VERIFY_ATTEMPTS ? { usedAt: now } : {}),
        },
      });

      if (nextAttempts >= MAX_VERIFY_ATTEMPTS) {
        throw new BadRequestException('Too many failed attempts. This OTP has been invalidated.');
      }

      throw new BadRequestException(`Invalid OTP code. ${MAX_VERIFY_ATTEMPTS - nextAttempts} attempts remaining.`);
    }

    // Success: mark as used
    await this.prisma.unscopedClient.otpCode.update({
      where: { id: otpRecord.id },
      data: { usedAt: now },
    });

    return true;
  }
}

