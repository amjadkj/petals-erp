import { plainToInstance } from 'class-transformer';
import { IsString, IsNumber, IsOptional, IsIn, Min, Max, validateSync } from 'class-validator';

export class EnvironmentVariables {
  @IsString()
  DATABASE_URL!: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(65535)
  PORT?: number = 3000;

  @IsString()
  @IsOptional()
  @IsIn(['development', 'test', 'production'])
  NODE_ENV?: string = 'development';

  @IsString()
  @IsOptional()
  APP_CORS_ORIGIN?: string = 'http://localhost:3001';

  @IsString()
  @IsOptional()
  JWT_SECRET?: string;

  @IsString()
  @IsOptional()
  JWT_REFRESH_SECRET?: string;

  @IsString()
  @IsOptional()
  JWT_ACCESS_EXPIRY?: string = '15m';

  @IsString()
  @IsOptional()
  JWT_REFRESH_EXPIRY?: string = '7d';

  // Redis (single configuration URL)
  @IsString()
  @IsOptional()
  REDIS_URL?: string = 'redis://localhost:6379';

  // Rate limiting
  @IsNumber()
  @IsOptional()
  RATE_LIMIT_USER_CAPACITY?: number = 40;

  @IsNumber()
  @IsOptional()
  RATE_LIMIT_USER_REFILL?: number = 2;

  @IsNumber()
  @IsOptional()
  RATE_LIMIT_IP_CAPACITY?: number = 10;

  @IsNumber()
  @IsOptional()
  RATE_LIMIT_IP_REFILL?: number = 0.5;

  // Request size limit
  @IsString()
  @IsOptional()
  REQUEST_SIZE_LIMIT?: string = '10mb';
}

export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `Config validation failed:\n${errors.map((e) => Object.values(e.constraints || {}).join(', ')).join('\n')}`,
    );
  }
  return validatedConfig;
}

