/** In-memory + tab session store. Cleared when tab closes or session.clear() is called. */
let _accessToken: string | null = null;
let _userId: string | null = null;
let _roleKey: string | null = null;
let _userName: string | null = null;
let _userEmail: string | null = null;
let _branchIds: string[] = [];

// Initialize in-memory cache from sessionStorage on client load
if (typeof window !== 'undefined') {
  try {
    _accessToken = sessionStorage.getItem('petals.accessToken');
    _userId = sessionStorage.getItem('petals.userId');
    _roleKey = sessionStorage.getItem('petals.roleKey');
    _userName = sessionStorage.getItem('petals.userName');
    _userEmail = sessionStorage.getItem('petals.userEmail');
    const storedBranches = sessionStorage.getItem('petals.branchIds');
    if (storedBranches) _branchIds = JSON.parse(storedBranches);
  } catch {
    // ignore
  }
}

export const session = {
  getAccessToken: () => _accessToken,
  setAccessToken: (token: string | null) => {
    _accessToken = token;
    if (typeof window !== 'undefined') {
      try {
        if (token) sessionStorage.setItem('petals.accessToken', token);
        else sessionStorage.removeItem('petals.accessToken');
      } catch {}
    }
  },
  getUserId: () => _userId,
  setUserId: (id: string | null) => {
    _userId = id;
    if (typeof window !== 'undefined') {
      try {
        if (id) sessionStorage.setItem('petals.userId', id);
        else sessionStorage.removeItem('petals.userId');
      } catch {}
    }
  },
  getRoleKey: () => _roleKey,
  setRoleKey: (key: string | null) => {
    _roleKey = key;
    if (typeof window !== 'undefined') {
      try {
        if (key) sessionStorage.setItem('petals.roleKey', key);
        else sessionStorage.removeItem('petals.roleKey');
      } catch {}
    }
  },
  getUserName: () => _userName,
  setUserName: (name: string | null) => {
    _userName = name;
    if (typeof window !== 'undefined') {
      try {
        if (name) sessionStorage.setItem('petals.userName', name);
        else sessionStorage.removeItem('petals.userName');
      } catch {}
    }
  },
  getUserEmail: () => _userEmail,
  setUserEmail: (email: string | null) => {
    _userEmail = email;
    if (typeof window !== 'undefined') {
      try {
        if (email) sessionStorage.setItem('petals.userEmail', email);
        else sessionStorage.removeItem('petals.userEmail');
      } catch {}
    }
  },
  getBranchIds: () => _branchIds,
  setBranchIds: (ids: string[]) => {
    _branchIds = ids;
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('petals.branchIds', JSON.stringify(ids));
      } catch {}
    }
  },
  clear: () => {
    _accessToken = null;
    _userId = null;
    _roleKey = null;
    _userName = null;
    _userEmail = null;
    _branchIds = [];
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('petals.accessToken');
        sessionStorage.removeItem('petals.userId');
        sessionStorage.removeItem('petals.roleKey');
        sessionStorage.removeItem('petals.userName');
        sessionStorage.removeItem('petals.userEmail');
        sessionStorage.removeItem('petals.branchIds');
      } catch {}
    }
  },
};
