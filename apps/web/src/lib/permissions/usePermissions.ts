import { AppModule, PermissionAction, RoleKey } from '@petals/types';
import { usePermissionsStore } from './store';

export function usePermissions() {
  const { permissions, roleKey } = usePermissionsStore();

  const isModuleEnabled = (module: AppModule): boolean => {
    // Director has access to everything
    if (roleKey === RoleKey.DIRECTOR) return true;
    return !!permissions[module]?.enabled;
  };

  const can = (module: AppModule, action: PermissionAction): boolean => {
    // Director has access to everything
    if (roleKey === RoleKey.DIRECTOR) return true;
    const mod = permissions[module];
    if (!mod || !mod.enabled) return false;
    return !!mod.actions[action];
  };

  return {
    can,
    isModuleEnabled,
    myRole: roleKey,
  };
}
