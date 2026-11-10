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
    CommonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
