import { AsyncLocalStorage } from 'async_hooks';
import { RoleKey, PermissionScope } from '@petals/types';

export interface IRequestContext {
  userId: string;
  roleId?: string;
  roleKey: RoleKey;
  isActive: boolean;
  branchIds: string[];
  activeBranchId: string | null;
  sessionId: string;
  ipAddress?: string;
  permissionScope?: PermissionScope;
  isSystem?: boolean;
}

class RequestContextStorage {
  private static instance: RequestContextStorage;
  private storage = new AsyncLocalStorage<IRequestContext>();

  static getInstance(): RequestContextStorage {
    if (!RequestContextStorage.instance) {
      RequestContextStorage.instance = new RequestContextStorage();
    }
    return RequestContextStorage.instance;
  }

  run<T>(ctx: IRequestContext, fn: () => T): T {
    return this.storage.run(ctx, fn);
  }

  runSystem<T>(fn: () => T): T {
    return this.storage.run(
      {
        userId: 'system',
        roleId: 'system',
        roleKey: RoleKey.DIRECTOR,
        isActive: true,
        branchIds: [],
        activeBranchId: null,
        sessionId: 'system',
        isSystem: true,
      },
      fn,
    );
  }

  current(): IRequestContext | undefined {
    return this.storage.getStore();
  }

  getStorage(): AsyncLocalStorage<IRequestContext> {
    return this.storage;
  }
}

export const RequestContext = RequestContextStorage.getInstance();

