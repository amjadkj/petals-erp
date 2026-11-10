import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { OtpService } from './otp/otp.service';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IRequestContext } from '../common/context/request-context';
import { RoleKey } from '@petals/types';
import {
  LoginDto,
  Verify2faLoginDto,
  Enable2faDto,
  Disable2faDto,
  RequestOtpDto,
  VerifyOtpDto,
  ChangePasswordDto,
} from './dto';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Email + password login' })
  @ApiResponse({ status: 200, description: 'Login successful or 2FA required' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'];

    const result = await this.authService.login(dto, ip, userAgent);

    if ('requires2FA' in result) {
      return result;
    }

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Set CSRF token in accessible cookie for client
    res.cookie('csrfToken', result.csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      user: result.user,
      accessToken: result.accessToken,
      csrfToken: result.csrfToken,
    };
  }

  @Public()
  @Post('2fa/verify-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify 2FA TOTP code to complete login' })
  async verify2faLogin(
    @Body() dto: Verify2faLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'];

    const result = await this.authService.verify2faLogin(
      dto.tempToken,
      dto.code,
      ip,
      userAgent,
    );

    res.cookie('refreshToken', result.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('csrfToken', result.csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      user: result.user,
      accessToken: result.accessToken,
      csrfToken: result.csrfToken,
    };
  }

  @Public()
  @Post('otp/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request OTP code for login or password reset' })
  async requestOtp(@Body() dto: RequestOtpDto) {
    return this.otpService.requestOtp(dto.target, dto.purpose);
  }

  @Public()
  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and log in' })
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'];

    const result = await this.authService.loginWithOtp(
      dto.target,
      dto.code,
      ip,
      userAgent,
    );

    res.cookie('refreshToken', result.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('csrfToken', result.csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      user: result.user,
      accessToken: result.accessToken,
      csrfToken: result.csrfToken,
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token and get a new access token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Headers('x-csrf-token') csrfHeader?: string,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    const csrfToken = req.cookies?.csrfToken;

    if (!refreshToken || !csrfToken) {
      throw new UnauthorizedException('Refresh token or CSRF token missing from cookies');
    }

    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'];

    const result = await this.authService.refreshTokens(
      refreshToken,
      csrfToken,
      csrfHeader,
      ip,
      userAgent,
    );

    res.cookie('refreshToken', result.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('csrfToken', result.csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken: result.accessToken,
      csrfToken: result.csrfToken,
    };
  }

  @Post('logout')
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER, RoleKey.THERAPIST, RoleKey.PARENT)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout current session' })
  async logout(
    @CurrentUser() user: IRequestContext,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (user?.sessionId) {
      await this.authService.logout(user.sessionId);
    }
    res.clearCookie('refreshToken', COOKIE_OPTIONS);
    res.clearCookie('csrfToken');
    return { message: 'Logged out successfully' };
  }

  @Post('logout-all')
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER, RoleKey.THERAPIST, RoleKey.PARENT)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout all sessions on all devices' })
  async logoutAll(
    @CurrentUser('userId') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logoutAll(userId);
    res.clearCookie('refreshToken', COOKIE_OPTIONS);
    res.clearCookie('csrfToken');
    return { message: 'All sessions logged out successfully' };
  }

  @Post('change-password')
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER, RoleKey.THERAPIST, RoleKey.PARENT)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change current user password' })
  async changePassword(
    @CurrentUser() user: IRequestContext,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.authService.changePassword(user.userId, user.sessionId, dto);
    return { message: 'Password changed successfully' };
  }

  @Post('2fa/setup')
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER, RoleKey.THERAPIST, RoleKey.PARENT)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate 2FA secret and QR code' })
  async setup2fa(@CurrentUser('userId') userId: string) {
    return this.authService.setup2fa(userId);
  }

  @Post('2fa/enable')
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER, RoleKey.THERAPIST, RoleKey.PARENT)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm 2FA setup and enable 2FA' })
  async enable2fa(
    @CurrentUser('userId') userId: string,
    @Body() dto: Enable2faDto,
  ) {
    return this.authService.enable2fa(userId, dto.code);
  }

  @Post('2fa/disable')
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER, RoleKey.THERAPIST, RoleKey.PARENT)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable 2FA' })
  async disable2fa(
    @CurrentUser('userId') userId: string,
    @Body() dto: Disable2faDto,
  ) {
    return this.authService.disable2fa(userId, dto.password, dto.code);
  }

  @Get('me')
  @Roles(RoleKey.DIRECTOR, RoleKey.MANAGER, RoleKey.THERAPIST, RoleKey.PARENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile, role, branches' })
  async getMe(@CurrentUser('userId') userId: string) {
    return this.authService.getMe(userId);
  }
}

