import { OtpService } from './otp.service';
import { OtpPurpose } from '@prisma/client';
import { sha256 } from '../../common/crypto';

describe('OtpService', () => {
  let service: OtpService;
  let mockPrisma: any;
  let mockLockout: any;
  let mockSender: any;

  beforeEach(() => {
    mockPrisma = {
      unscopedClient: {
        otpCode: {
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
          create: jest.fn().mockResolvedValue({ id: 'otp-1' }),
          findFirst: jest.fn(),
          update: jest.fn(),
        },
      },
    };

    mockLockout = {
      recordFailure: jest.fn().mockResolvedValue({ locked: false, retryAfterSeconds: 0 }),
    };

    mockSender = {
      send: jest.fn().mockResolvedValue(undefined),
    };

    service = new OtpService(mockPrisma, mockLockout, mockSender);
  });

  describe('requestOtp', () => {
    it('should generate OTP, invalidate prior codes, and send', async () => {
      const result = await service.requestOtp('+919876543210', OtpPurpose.LOGIN);

      expect(result.message).toBe('OTP sent successfully');

      // Invalidates previous OTPs
      expect(mockPrisma.unscopedClient.otpCode.updateMany).toHaveBeenCalledWith({
        where: {
          target: '+919876543210',
          purpose: OtpPurpose.LOGIN,
          usedAt: null,
        },
        data: { usedAt: expect.any(Date) },
      });

      // Stores new OTP
      expect(mockPrisma.unscopedClient.otpCode.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          target: '+919876543210',
          purpose: OtpPurpose.LOGIN,
          codeHash: expect.any(String),
          attempts: 0,
        }),
      });

      // Sends code via sender
      expect(mockSender.send).toHaveBeenCalledWith(
        '+919876543210',
        expect.stringMatching(/^\d{6}$/),
        OtpPurpose.LOGIN,
      );
    });
  });

  describe('verifyOtp', () => {
    it('should verify valid code and mark as used', async () => {
      const rawCode = '123456';
      const codeHash = sha256(rawCode);

      mockPrisma.unscopedClient.otpCode.findFirst.mockResolvedValue({
        id: 'otp-1',
        codeHash,
        attempts: 0,
        expiresAt: new Date(Date.now() + 60000),
      });

      const isValid = await service.verifyOtp('+919876543210', rawCode);

      expect(isValid).toBe(true);
      expect(mockPrisma.unscopedClient.otpCode.update).toHaveBeenCalledWith({
        where: { id: 'otp-1' },
        data: { usedAt: expect.any(Date) },
      });
    });

    it('should increment attempts on invalid code and show remaining attempts', async () => {
      const rawCode = '123456';
      const codeHash = sha256(rawCode);

      mockPrisma.unscopedClient.otpCode.findFirst.mockResolvedValue({
        id: 'otp-1',
        codeHash,
        attempts: 1,
        expiresAt: new Date(Date.now() + 60000),
      });

      await expect(service.verifyOtp('+919876543210', '999999')).rejects.toThrow(
        /Invalid OTP code\. 3 attempts remaining\./,
      );

      expect(mockPrisma.unscopedClient.otpCode.update).toHaveBeenCalledWith({
        where: { id: 'otp-1' },
        data: { attempts: 2 },
      });
    });

    it('should invalidate code after 5 failed attempts', async () => {
      const rawCode = '123456';
      const codeHash = sha256(rawCode);

      mockPrisma.unscopedClient.otpCode.findFirst.mockResolvedValue({
        id: 'otp-1',
        codeHash,
        attempts: 4,
        expiresAt: new Date(Date.now() + 60000),
      });

      await expect(service.verifyOtp('+919876543210', '999999')).rejects.toThrow(
        /Too many failed attempts\. This OTP has been invalidated\./,
      );

      // Marks usedAt to invalidate
      expect(mockPrisma.unscopedClient.otpCode.update).toHaveBeenCalledWith({
        where: { id: 'otp-1' },
        data: expect.objectContaining({ attempts: 5, usedAt: expect.any(Date) }),
      });
    });
  });
});

