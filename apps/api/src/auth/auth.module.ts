import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { OtpService } from './otp/otp.service';
import { OTP_SENDER, ConsoleOtpSender } from './otp/otp-sender.interface';
import { AuthGuard } from '../common/guards/auth.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'petals-dev-jwt-secret-replace-in-production-12345'),
        signOptions: {
          expiresIn: (config.get<string>('JWT_ACCESS_EXPIRY', '15m') as any),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    OtpService,
    {
      provide: OTP_SENDER,
      useClass: ConsoleOtpSender,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [AuthService, OtpService, JwtModule],
})
export class AuthModule {}
