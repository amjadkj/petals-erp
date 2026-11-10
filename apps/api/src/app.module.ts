import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './common/config/env.validation';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { AccessModule } from './access/access.module';
import { BranchModule } from './branch/branch.module';
import { DepartmentModule } from './department/department.module';
import { UserModule } from './user/user.module';
import { EmployeeModule } from './employee/employee.module';
import { AuditModule } from './audit/audit.module';
import { ClinicalHistoryModule } from './clinical-history/clinical-history.module';
import { ClientModule } from './client/client.module';
import { ClinicalModule } from './clinical/clinical.module';
import { AppointmentModule } from './appointment/appointment.module';
import { FinanceModule } from './finance/finance.module';
import { ReportModule } from './report/report.module';
import { LeadModule } from './lead/lead.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
      validate,
    }),
    AuthModule,
    AccessModule,
    BranchModule,
    DepartmentModule,
    UserModule,
    EmployeeModule,
    AuditModule,
    ClinicalHistoryModule,
    ClientModule,
    ClinicalModule,
    AppointmentModule,
    FinanceModule,
    ReportModule,
    LeadModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
