import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { randomUUID } from 'crypto';
import { PrismaService } from '../common/prisma';
import { CacheService } from '../common/redis';
import { LockoutService } from '../common/rate-limit/lockout.service';
import { OtpService } from './otp/otp.service';
import { RoleKey } from '@petals/types';
import {
  hashPassword,
  verifyPassword,
  encryptSecret,
  decryptSecret,
  sha256,
  generateRandomToken,
} from '../common/crypto';
import { LoginDto, ChangePasswordDto } from './dto';

const REFRESH_TOKEN_TTL_DAYS = 7;

export interface TokenPayload {
  sub: string;
  sessionId: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    roleKey: RoleKey;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly cache: CacheService,
    private readonly lockout: LockoutService,
    private readonly otpService: OtpService,
  ) {}

  /**
   * Password login with Argon2, lockout protection, and constant-time failure.
   */
  async login(
    dto: LoginDto,
    ipAddress: string = '127.0.0.1',
    userAgent?: string,
  ): Promise<AuthTokens | { requires2FA: true; tempToken: string }> {
    const cleanEmail = dto.email.trim().toLowerCase();

    // 1. Check account lockout: 5 failures / 15 min per account
    const accountLock = await this.lockout.recordFailure(
      cleanEmail,
      'login_account',
      5,
      15 * 60,
      15 * 60, // 15 min escalating delay
    );
    if (accountLock.locked) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many failed login attempts on this account. Please wait before trying again.',
          error: 'Too Many Requests',
          retryAfter: accountLock.retryAfterSeconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 2. Check IP lockout: 20 failures / 15 min per IP
    const ipLock = await this.lockout.recordFailure(
      ipAddress,
      'login_ip',
      20,
      15 * 60,
      15 * 60,
    );
    if (ipLock.locked) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many failed login attempts from this network. Please wait.',
          error: 'Too Many Requests',
          retryAfter: ipLock.retryAfterSeconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 3. Find user (unscoped client for auth)
    const user = await this.prisma.unscopedClient.user.findUnique({
      where: { email: cleanEmail },
      include: { role: true },
    });

    // Constant-time check if user does not exist to prevent user enumeration
    if (!user) {
      await hashPassword('dummy-timing-password');
      throw new UnauthorizedException('Invalid email or password');
    }

    // 4. Verify password
    const validPassword = await verifyPassword(user.passwordHash, dto.password);
    if (!validPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 5. Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account has been deactivated');
    }

    // 6. Check if 2FA is required (Director must have 2FA enabled, or if user has it enabled)
    if (user.twoFactorEnabled) {
      // Issue a short-lived temp token for 2FA challenge
      const tempToken = this.jwtService.sign(
        { sub: user.id, is2faPending: true },
        { expiresIn: '5m' },
      );
      return { requires2FA: true, tempToken };
    }

    // Clear lockout on successful login
    await this.lockout.clearLockout(cleanEmail, 'login_account');

    // 7. Issue session & tokens
    return this.createSessionAndTokens(user, ipAddress, userAgent);
  }

  /**
   * Complete 2FA login challenge.
   */
  async verify2faLogin(
    tempToken: string,
    code: string,
    ipAddress: string = '127.0.0.1',
    userAgent?: string,
  ): Promise<AuthTokens> {
    let payload: any;
    try {
      payload = this.jwtService.verify(tempToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired 2FA session');
    }

    if (!payload.sub || !payload.is2faPending) {
      throw new UnauthorizedException('Invalid 2FA session token');
    }

    const user = await this.prisma.unscopedClient.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });

    if (!user || !user.isActive || !user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new UnauthorizedException('Invalid 2FA request');
    }

    // Decrypt stored 2FA secret and verify TOTP code
    const secret = decryptSecret(user.twoFactorSecret);
    const isValid = authenticator.verify({ token: code.trim(), secret });
    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA verification code');
    }

    await this.lockout.clearLockout(user.email, 'login_account');
    return this.createSessionAndTokens(user, ipAddress, userAgent);
  }

  /**
   * Login with OTP (for Parents / mobile users).
   */
  async loginWithOtp(
    target: string,
    code: string,
    ipAddress: string = '127.0.0.1',
    userAgent?: string,
  ): Promise<AuthTokens> {
    const cleanTarget = target.trim().toLowerCase();

    // Verify OTP code (max 5 attempts, invalidates if exceeded)
    await this.otpService.verifyOtp(cleanTarget, code);

    // Look up user by phone or email
    const user = await this.prisma.unscopedClient.user.findFirst({
      where: {
        OR: [{ email: cleanTarget }, { phone: cleanTarget }],
      },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('No account found for this phone or email');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account has been deactivated');
    }

    return this.createSessionAndTokens(user, ipAddress, userAgent);
  }

  /**
   * Refresh token rotation with reuse detection.
   */
  async refreshTokens(
    refreshToken: string,
    csrfToken: string,
    csrfHeader?: string,
    ipAddress: string = '127.0.0.1',
    userAgent?: string,
  ): Promise<{ accessToken: string; refreshToken: string; csrfToken: string }> {
    // 1. Strict counter: 30 refreshes per hour
    const refreshLock = await this.lockout.recordFailure(
      ipAddress,
      'refresh_rate',
      30,
      3600,
      3600,
    );
    if (refreshLock.locked) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many token refresh requests',
          error: 'Too Many Requests',
          retryAfter: refreshLock.retryAfterSeconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 2. Validate CSRF header against cookie
    if (!csrfHeader || csrfHeader !== csrfToken) {
      throw new ForbiddenException('CSRF token validation failed');
    }

    const tokenHash = sha256(refreshToken);
    const session = await this.prisma.unscopedClient.session.findUnique({
      where: { refreshTokenHash: tokenHash },
      include: { user: { include: { role: true } } },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // 3. Token Reuse Detection!
    // If an already-revoked token is presented, REVOKE the entire family chain!
    if (session.revokedAt !== null) {
      this.logger.warn(
        `Token reuse detected for family ${session.familyId}! Revoking all sessions for user ${session.userId}.`,
      );
      await this.prisma.unscopedClient.session.updateMany({
        where: { familyId: session.familyId },
        data: { revokedAt: new Date() },
      });
      // Invalidate user cache
      await this.invalidateUserCache(session.userId);
      throw new UnauthorizedException('Session revoked due to token reuse');
    }

    // Check expiration
    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    if (!session.user.isActive) {
      throw new UnauthorizedException('Account has been deactivated');
    }

    // 4. Rotate token: revoke old session and create a new one in the same family
    const now = new Date();
    await this.prisma.unscopedClient.session.update({
      where: { id: session.id },
      data: { revokedAt: now, lastUsedAt: now },
    });

    const newRefreshToken = generateRandomToken(40);
    const newRefreshHash = sha256(newRefreshToken);
    const newCsrfToken = generateRandomToken(24);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

    const newSession = await this.prisma.unscopedClient.session.create({
      data: {
        userId: session.userId,
        familyId: session.familyId,
        refreshTokenHash: newRefreshHash,
        userAgent,
        ipAddress,
        expiresAt,
      },
    });

    // Short-lived access token with only sub and sessionId
    const accessToken = this.jwtService.sign(
      { sub: session.userId, sessionId: newSession.id },
      { expiresIn: (this.config.get<string>('JWT_ACCESS_EXPIRY', '15m') as any) },
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
      csrfToken: newCsrfToken,
    };
  }

  /**
   * Log out of the current session.
   */
  async logout(sessionId: string): Promise<void> {
    await this.prisma.unscopedClient.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Log out of all sessions across all devices.
   */
  async logoutAll(userId: string): Promise<void> {
    await this.prisma.unscopedClient.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await this.invalidateUserCache(userId);
  }

  /**
   * Change password and revoke all other sessions.
   */
  async changePassword(userId: string, currentSessionId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.unscopedClient.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const validCurrent = await verifyPassword(user.passwordHash, dto.currentPassword);
    if (!validCurrent) {
      throw new BadRequestException('Current password is incorrect');
    }

    const newHash = await hashPassword(dto.newPassword);
    await this.prisma.unscopedClient.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    // Revoke all OTHER active sessions
    await this.prisma.unscopedClient.session.updateMany({
      where: {
        userId,
        id: { not: currentSessionId },
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    await this.invalidateUserCache(userId);
  }

  /**
   * Setup 2FA: generates secret and QR code for authenticator app.
   */
  async setup2fa(userId: string): Promise<{ secret: string; qrCodeUrl: string }> {
    const user = await this.prisma.unscopedClient.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const secret = authenticator.generateSecret();
    const appName = 'Petals ERP';
    const otpauthUrl = authenticator.keyuri(user.email, appName, secret);
    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

    // Cache unconfirmed secret temporarily in Redis (10 minutes)
    await this.cache.set(`2fa_setup:${userId}`, secret, 600);

    return { secret, qrCodeUrl };
  }

  /**
   * Enable 2FA after verifying the first confirmation code.
   */
  async enable2fa(userId: string, code: string): Promise<{ success: boolean }> {
    const secret = await this.cache.get<string>(`2fa_setup:${userId}`);
    if (!secret) {
      throw new BadRequestException('2FA setup session expired. Please start over.');
    }

    const isValid = authenticator.verify({ token: code.trim(), secret });
    if (!isValid) {
      throw new BadRequestException('Invalid 2FA verification code');
    }

    // Encrypt secret with application key before storing in DB
    const encrypted = encryptSecret(secret);
    await this.prisma.unscopedClient.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: encrypted,
      },
    });

    await this.cache.del(`2fa_setup:${userId}`);
    await this.invalidateUserCache(userId);

    return { success: true };
  }

  /**
   * Disable 2FA with password & code confirmation.
   * Directors cannot disable 2FA.
   */
  async disable2fa(userId: string, password: string, code: string): Promise<{ success: boolean }> {
    const user = await this.prisma.unscopedClient.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new BadRequestException('2FA is not enabled on this account');
    }

    if (user.role.key === RoleKey.DIRECTOR) {
      throw new ForbiddenException('2FA is mandatory for Directors and cannot be disabled');
    }

    const validPass = await verifyPassword(user.passwordHash, password);
    if (!validPass) {
      throw new BadRequestException('Invalid password');
    }

    const secret = decryptSecret(user.twoFactorSecret);
    const validCode = authenticator.verify({ token: code.trim(), secret });
    if (!validCode) {
      throw new BadRequestException('Invalid 2FA code');
    }

    await this.prisma.unscopedClient.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    await this.invalidateUserCache(userId);
    return { success: true };
  }

  /**
   * Refuse to deactivate or demote the last active Director.
   */
  async assertCanDeactivateOrDemote(targetUserId: string): Promise<void> {
    const target = await this.prisma.unscopedClient.user.findUnique({
      where: { id: targetUserId },
      include: { role: true },
    });

    if (!target || target.role.key !== RoleKey.DIRECTOR) {
      return;
    }

    const activeDirectorsCount = await this.prisma.unscopedClient.user.count({
      where: {
        role: { key: RoleKey.DIRECTOR },
        isActive: true,
      },
    });

    if (activeDirectorsCount <= 1) {
      throw new ForbiddenException('Cannot deactivate or demote the last active Director');
    }
  }

  /**
   * GET /me: current authenticated user profile, role, branches.
   */
  async getMe(userId: string) {
    const user = await this.prisma.unscopedClient.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        twoFactorEnabled: true,
        lastLoginAt: true,
        createdAt: true,
        role: {
          select: {
            id: true,
            key: true,
            name: true,
          },
        },
        branches: {
          select: {
            isPrimary: true,
            branch: {
              select: {
                id: true,
                name: true,
                code: true,
                city: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const primaryBranch = user.branches.find((b) => b.isPrimary)?.branch || user.branches[0]?.branch || null;
    const branchIds = user.branches.map((b) => b.branch.id);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roleKey: user.role.key as unknown as RoleKey,
      roleName: user.role.name,
      twoFactorEnabled: user.twoFactorEnabled,
      primaryBranch,
      branches: user.branches.map((b) => b.branch),
      branchIds,
    };
  }

  /**
   * Helper: create session, hash refresh token, and generate tokens.
   */
  private async createSessionAndTokens(
    user: any,
    ipAddress: string,
    userAgent?: string,
  ): Promise<AuthTokens> {
    const familyId = randomUUID();
    const refreshToken = generateRandomToken(40);
    const refreshTokenHash = sha256(refreshToken);
    const csrfToken = generateRandomToken(24);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

    const session = await this.prisma.unscopedClient.session.create({
      data: {
        userId: user.id,
        familyId,
        refreshTokenHash,
        userAgent,
        ipAddress,
        expiresAt,
      },
    });

    await this.prisma.unscopedClient.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Short-lived access token with sub + sessionId ONLY
    const accessToken = this.jwtService.sign(
      { sub: user.id, sessionId: session.id },
      { expiresIn: (this.config.get<string>('JWT_ACCESS_EXPIRY', '15m') as any) },
    );

    return {
      accessToken,
      refreshToken,
      csrfToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roleKey: user.role.key as unknown as RoleKey,
      },
    };
  }

  /**
   * Invalidate cached user session and permission data.
   */
  async invalidateUserCache(userId: string): Promise<void> {
    await this.cache.del(`user:${userId}`);
    await this.cache.deleteByPrefix(`user_perms:${userId}`);
  }
}
