import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AppModule, PermissionAction } from '@petals/types';

export class RolePermissionItemDto {
  @ApiProperty({ enum: AppModule, example: AppModule.CLIENTS })
  @IsEnum(AppModule)
  module!: AppModule;

  @ApiProperty({ enum: PermissionAction, example: PermissionAction.VIEW })
  @IsEnum(PermissionAction)
  action!: PermissionAction;

  @ApiProperty({ example: true })
  @IsBoolean()
  allowed!: boolean;
}

export class UpdateRolePermissionsDto {
  @ApiProperty({ type: [RolePermissionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RolePermissionItemDto)
  permissions!: RolePermissionItemDto[];
}

