import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AppModule, PermissionAction } from '@petals/types';

export class UserOverrideItemDto {
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

export class UpdateUserOverridesDto {
  @ApiProperty({ type: [UserOverrideItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserOverrideItemDto)
  overrides!: UserOverrideItemDto[];
}

