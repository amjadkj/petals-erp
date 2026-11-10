import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AppModule } from '@petals/types';

export class RoleModuleItemDto {
  @ApiProperty({ enum: AppModule, example: AppModule.CLIENTS })
  @IsEnum(AppModule)
  module!: AppModule;

  @ApiProperty({ example: true })
  @IsBoolean()
  enabled!: boolean;
}

export class UpdateRoleModulesDto {
  @ApiProperty({ type: [RoleModuleItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoleModuleItemDto)
  modules!: RoleModuleItemDto[];
}

