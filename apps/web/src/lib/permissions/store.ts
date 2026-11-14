import { create } from 'zustand';
import { AppModule, RoleKey } from '@petals/types';
import { accessApi, type ModulePermissionMap } from '@/lib/api/access';
import { session } from '@/lib/auth/session';

export type PermissionsMap = Partial<Record<AppModule, ModulePermissionMap>>;

interface PermissionsState {
  permissions: PermissionsMap;
  roleKey: RoleKey | null;
  selectedBranchId: string;
  sidebarExpanded: boolean;
  isLoading: boolean;
  setSelectedBranchId: (branchId: string) => void;
  setSidebarExpanded: (expanded: boolean) => void;
  toggleSidebar: () => void;
  loadPermissions: () => Promise<void>;
  reset: () => void;
}

const STORAGE_KEY_BRANCH = 'petals.selectedBranchId';
const STORAGE_KEY_SIDEBAR = 'petals.sidebar';

function getInitialBranch(): string {
  if (typeof window === 'undefined') return '';
  const stored = localStorage.getItem(STORAGE_KEY_BRANCH);
  if (stored && stored !== 'ALL') return stored;
  return '';
}

function getInitialSidebar(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(STORAGE_KEY_SIDEBAR);
  if (stored !== null) return stored === 'expanded';
  return window.innerWidth >= 1200;
}

export const usePermissionsStore = create<PermissionsState>((set) => ({
  permissions: {},
  roleKey: null,
  selectedBranchId: getInitialBranch(),
  sidebarExpanded: getInitialSidebar(),
  isLoading: false,

  setSelectedBranchId: (selectedBranchId) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_BRANCH, selectedBranchId);
    }
    set({ selectedBranchId });
  },

  setSidebarExpanded: (sidebarExpanded) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_SIDEBAR, sidebarExpanded ? 'expanded' : 'collapsed');
    }
    set({ sidebarExpanded });
  },

  toggleSidebar: () =>
    set((state) => {
      const next = !state.sidebarExpanded;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_SIDEBAR, next ? 'expanded' : 'collapsed');
      }
      return { sidebarExpanded: next };
    }),

  loadPermissions: async () => {
    set({ isLoading: true });
    try {
      const res = await accessApi.getMyPermissions();
      if (res?.data) {
        const raw = res.data as any;
        const perms = raw.permissions || raw.modules || {};
        set({
          permissions: perms,
          roleKey: (raw.roleKey as RoleKey) ?? null,
        });
        if (raw.roleKey) {
          session.setRoleKey(raw.roleKey);
        }
      }
    } catch {
      // Default to empty permissions if error
      set({ permissions: {} });
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => {
    set({
      permissions: {},
      roleKey: null,
      selectedBranchId: '',
      isLoading: false,
    });
  },
}));
