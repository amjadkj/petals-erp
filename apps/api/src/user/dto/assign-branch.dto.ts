import { IsBoolean, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class AssignBranchDto {
  @IsUUID()
  @IsNotEmpty()
  branchId!: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}

