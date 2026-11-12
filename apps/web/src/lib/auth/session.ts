/** In-memory token store. Never persisted to disk. */
let _accessToken: string | null = null;
let _userId: string | null = null;
let _roleKey: string | null = null;
let _branchIds: string[] = [];

export const session = {
  getAccessToken: () => _accessToken,
  setAccessToken: (token: string | null) => { _accessToken = token; },
  getUserId: () => _userId,
  setUserId: (id: string | null) => { _userId = id; },
  getRoleKey: () => _roleKey,
  setRoleKey: (key: string | null) => { _roleKey = key; },
  getBranchIds: () => _branchIds,
  setBranchIds: (ids: string[]) => { _branchIds = ids; },
  clear: () => {
    _accessToken = null;
    _userId = null;
    _roleKey = null;
    _branchIds = [];
  },
};
