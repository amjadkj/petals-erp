import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from '../src/app.module';

async function exportOpenApi() {
  console.log('Generating OpenAPI specification from NestJS metadata...');
  const app = await NestFactory.create(AppModule, { logger: false });

  app.setGlobalPrefix('api/v1', {
    exclude: ['health', 'api/docs'],
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Petals Child Development Centre ERP API')
    .setDescription(
      'Comprehensive REST API for Petals Child Development Centre — Multi-Branch Pediatric Therapy ERP. Includes Authentication, RBAC, Clinical Management, Appointments & Schedule, Financial Operations, HRMS, and Reports.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your Bearer Access Token',
      },
      'bearer',
    )
    .addTag('Health', 'System and connectivity health check')
    .addTag('Auth', 'Authentication, token rotation, TOTP 2FA, OTP login')
    .addTag('Access', 'Role & Permission management, Director overrides')
    .addTag('Branch', 'Multi-branch operations and clinic locations')
    .addTag('Department', 'Therapy departments (ST, OT, PT, ABA, CP)')
    .addTag('Employee', 'Staff, therapist profiles, salary masking')
    .addTag('User', 'User accounts, branch assignments, deactivation')
    .addTag('Clients', 'Pediatric client profiles, guardians, case history')
    .addTag('Clinical', 'Assessments, treatment plans, goals, progress tracking')
    .addTag('Appointments', 'Daily schedule, calendar, room/therapist booking')
    .addTag('Finance', 'Invoices, payments, expenses, P&L, revenue analytics')
    .addTag('Reports', 'Clinical reports, file uploads with signed URLs')
    .addTag('Leads', 'Lead CRM, Kanban board, client conversion')
    .addTag('Communication', 'WhatsApp/Email messaging, call logs, delivery webhooks')
    .addTag('HR', 'Staff attendance, leave requests, holiday calendar')
    .addTag('Dashboard', 'Role-specific operational and executive dashboards')
    .addTag('Audit', 'Audit trail inspection, clinical entity version history')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  const outputPath = path.resolve(__dirname, '../../../docs/openapi.json');
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2), 'utf8');

  console.log(`✅ Successfully exported OpenAPI specification to ${outputPath}`);
  await app.close();
}

exportOpenApi()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Failed to export OpenAPI spec:', err);
    process.exit(1);
  });

