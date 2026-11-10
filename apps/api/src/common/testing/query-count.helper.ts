import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Test helper to count Prisma queries during a request.
 *
 * Usage in e2e tests:
 *   const counter = new QueryCounter(app);
 *   counter.start();
 *   await request(app.getHttpServer()).get('/api/v1/clients').expect(200);
 *   const count = counter.stop();
 *   expect(count).toBeLessThanOrEqual(4);
 */
export class QueryCounter {
  private prisma: PrismaService;

  constructor(app: INestApplication) {
    this.prisma = app.get(PrismaService);
  }

  start(): void {
    this.prisma.startQueryCount();
  }

  stop(): number {
    return this.prisma.stopQueryCount();
  }

  reset(): void {
    this.prisma.resetQueryCount();
  }

  current(): number {
    return this.prisma.getQueryCount();
  }
}

