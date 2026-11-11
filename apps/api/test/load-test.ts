import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import autocannon from 'autocannon';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters';
import { QueryCounter } from '../src/common/testing';
import { PrismaService } from '../src/common/prisma';

async function runLoadTests() {
  console.log('🚀 Bootstrapping Petals API for Autocannon load testing...');
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  app.use(helmet());
  app.use(cookieParser());
  app.setGlobalPrefix('api/v1', {
    exclude: ['health', 'api/docs'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());

  const PORT = 3333;
  await app.listen(PORT, '127.0.0.1');
  const baseUrl = `http://127.0.0.1:${PORT}`;

  const prisma = app.get(PrismaService);
  const queryCounter = new QueryCounter(app);

  try {
    // 1. Authenticate as Director
    console.log('🔑 Authenticating as Director to acquire Bearer token...');
    const loginRes = await request(baseUrl)
      .post('/api/v1/auth/login')
      .send({ email: 'director@petals.com', password: 'ChangeMe123!' });

    if (loginRes.status !== 200 || !loginRes.body.accessToken) {
      throw new Error(`Login failed with status ${loginRes.status}: ${JSON.stringify(loginRes.body)}`);
    }

    const token = loginRes.body.accessToken;

    // 2. Resolve active branch
    const branch = await prisma.unscopedClient.branch.findFirstOrThrow({
      where: { isActive: true },
    });
    const branchId = branch.id;
    console.log(`📍 Using Branch: ${branch.name} (${branchId})`);

    const endpoints = [
      {
        name: 'Client List',
        path: '/api/v1/clients?page=1&pageSize=20',
        method: 'GET',
      },
      {
        name: 'Daily Schedule',
        path: `/api/v1/appointments/daily?branchId=${branchId}&date=2026-11-11`,
        method: 'GET',
      },
      {
        name: 'Dashboard',
        path: `/api/v1/dashboard?branchId=${branchId}`,
        method: 'GET',
      },
    ];

    const results: Array<{
      endpoint: string;
      queries: number;
      p50: number;
      p90: number;
      p95: number;
      p99: number;
      reqSec: number;
    }> = [];

    for (const ep of endpoints) {
      console.log(`\n─────────────────────────────────────────────────────────────`);
      console.log(`🔍 Profiling: ${ep.name} [${ep.path}]`);

      // A. Query Count Analysis
      queryCounter.start();
      const probeRes = await request(baseUrl)
        .get(ep.path)
        .set('Authorization', `Bearer ${token}`)
        .set('x-webhook-signature', 'load-test');
      const queryCount = queryCounter.stop();

      if (probeRes.status >= 400) {
        console.warn(`⚠️ Warning: Endpoint returned ${probeRes.status}: ${JSON.stringify(probeRes.body)}`);
      }
      console.log(`📊 Single-request Prisma query count: ${queryCount}`);

      // B. Autocannon Benchmark
      console.log(`⚡ Running Autocannon benchmark (connections=10, duration=5s)...`);
      const bench = await autocannon({
        url: `${baseUrl}${ep.path}`,
        connections: 10,
        duration: 5,
        pipelining: 1,
        headers: {
          Authorization: `Bearer ${token}`,
          'x-webhook-signature': 'load-test',
        },
      });

      const lat = bench.latency as any;
      const p95 = lat.p95 ?? lat.p97_5 ?? lat.p90;

      results.push({
        endpoint: ep.name,
        queries: queryCount,
        p50: bench.latency.p50,
        p90: (lat.p90 ?? bench.latency.p50) as number,
        p95: p95 as number,
        p99: bench.latency.p99,
        reqSec: bench.requests.average,
      });

      console.log(`   Req/Sec: ${bench.requests.average.toFixed(1)}`);
      console.log(`   Latency (p50): ${bench.latency.p50} ms`);
      console.log(`   Latency (p95): ${p95} ms`);
      console.log(`   Latency (p99): ${bench.latency.p99} ms`);
    }

    console.log(`\n=============================================================`);
    console.log(`🎯 AUTOCANNON BENCHMARK & QUERY COUNT SUMMARY`);
    console.log(`=============================================================`);
    console.table(
      results.map((r) => ({
        Endpoint: r.endpoint,
        'Prisma Queries': r.queries,
        'Req/sec': r.reqSec.toFixed(1),
        'p50 (ms)': r.p50,
        'p95 (ms)': r.p95,
        'p99 (ms)': r.p99,
      })),
    );

    console.log(`\nMarkdown Table for Documentation:`);
    console.log(`| Endpoint | Prisma Queries | Req/sec | p50 (ms) | p95 (ms) | p99 (ms) |`);
    console.log(`| :--- | :---: | :---: | :---: | :---: | :---: |`);
    for (const r of results) {
      console.log(
        `| ${r.endpoint} | ${r.queries} | ${r.reqSec.toFixed(1)} | ${r.p50} | ${r.p95} | ${r.p99} |`,
      );
    }
  } finally {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await app.close();
  }
}

runLoadTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Benchmark error:', err);
    process.exit(1);
  });
