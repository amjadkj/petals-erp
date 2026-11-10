import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/http-exception.filter';
import { QueryCounter } from '../src/common/testing/query-count.helper';

describe('Common Layer (e2e)', () => {
  let app: INestApplication;
  let queryCounter: QueryCounter;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api/v1', {
      exclude: ['health', 'api/docs'],
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.useGlobalFilters(new GlobalExceptionFilter());

    await app.init();
    queryCounter = new QueryCounter(app);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Global Exception Filter', () => {
    it('should format 404 errors in the standard error envelope', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/non-existent-route')
        .expect(404);

      expect(res.body).toEqual(
        expect.objectContaining({
          statusCode: 404,
          error: 'Not Found',
          timestamp: expect.any(String),
          path: '/api/v1/non-existent-route',
        }),
      );
    });
  });

  describe('QueryCounter helper', () => {
    it('should accurately track query counting lifecycle', () => {
      queryCounter.start();
      expect(queryCounter.current()).toBe(0);
      const count = queryCounter.stop();
      expect(count).toBe(0);
    });
  });

  describe('Rate Limiting (IP burst)', () => {
    it('should return 429 with Retry-After header when IP token bucket is exhausted', async () => {
      const server = app.getHttpServer();

      // Make 10 requests to consume unauthenticated IP capacity
      for (let i = 0; i < 10; i++) {
        await request(server).get('/health');
      }

      // 11th request exceeds capacity
      const res = await request(server).get('/health').expect(429);

      expect(res.body).toEqual(
        expect.objectContaining({
          statusCode: 429,
          error: 'Too Many Requests',
        }),
      );
      expect(res.body.retryAfter).toBeGreaterThan(0);
    });
  });
});
