import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Trust proxy so the real client IP is used (not the load balancer)
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  // Security
  app.use(helmet());
  app.use(cookieParser());

  // Request size limits
  const sizeLimit = process.env.REQUEST_SIZE_LIMIT || '10mb';
  app.use(json({ limit: sizeLimit }));
  app.use(urlencoded({ extended: true, limit: sizeLimit }));

  // CORS allow-list
  app.enableCors({
    origin: process.env.APP_CORS_ORIGIN?.split(',').map((s) => s.trim()) || [
      'http://localhost:3001',
    ],
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api/v1', {
    exclude: ['health', 'api/docs'],
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Petals Child Development Centre ERP API')
    .setDescription('Backend REST API for Petals ERP')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Petals ERP API server running on port ${port}`);
}

bootstrap();
