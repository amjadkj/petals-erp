import type { AppModule, PermissionAction, RoleKey } from '@petals/types';
import type {
  RoleDetailDto,
  UserOverrideDto,
} from '@/lib/api/access';
import type {
  BranchDto,
  UserBranchAssignmentDto,
  BranchWithStatsDto,
} from '@/lib/api/branches';

export type RoleAccessMainTab = 'permissions' | 'branches';
export type PermissionsSubTab = 'roles' | 'overrides';

export interface MatrixRowDefinition {
  module: AppModule;
  label: string;
  isSubModule?: boolean;
  parentModule?: AppModule;
  clinicalOnly?: boolean;
  directorOnly?: boolean;
  notApplicableActions?: PermissionAction[];
}

export type {
  AppModule,
  PermissionAction,
  RoleKey,
  RoleDetailDto,
  UserOverrideDto,
  BranchDto,
  UserBranchAssignmentDto,
  BranchWithStatsDto,
};

