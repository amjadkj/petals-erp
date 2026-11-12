import { session } from '@/lib/auth/session';
import { getCsrfToken } from '@/lib/auth/csrf';
import { usePermissionsStore } from '@/lib/permissions/store';

export class PermissionError extends Error {
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'PermissionError';
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'x-csrf-token': getCsrfToken() ?? '',
      },
    });
    if (!res.ok) return false;
    const json = await res.json();
    if (json?.data?.accessToken) {
      session.setAccessToken(json.data.accessToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function fetcher<T>(
  path: string,
  init: RequestInit = {},
  options: { skipBranchId?: boolean } = {},
): Promise<T> {
  const token = session.getAccessToken();
  const csrf = getCsrfToken();
  const selectedBranchId = usePermissionsStore.getState().selectedBranchId;

  // Build URL
  let url = `${BASE_URL}/api/v1${path}`;
  if (!options.skipBranchId && selectedBranchId && selectedBranchId !== 'ALL') {
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}branchId=${selectedBranchId}`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (csrf) headers['x-csrf-token'] = csrf;

  const makeRequest = () =>
    fetch(url, { ...init, headers, credentials: 'include' });

  let res = await makeRequest();

  // 401 → try refresh once
  if (res.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = doRefresh().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }
    const refreshed = await refreshPromise;
    if (refreshed) {
      headers['Authorization'] = `Bearer ${session.getAccessToken()}`;
      res = await makeRequest();
    } else {
      session.clear();
      if (typeof window !== 'undefined') window.location.href = '/login';
      throw new ApiError(401, 'Unauthorized');
    }
  }

  if (res.status === 403) throw new PermissionError();

  if (!res.ok) {
    let body: any;
    try {
      body = await res.json();
    } catch {
      /* ignore */
    }
    const message =
      (Array.isArray(body?.message) ? body.message.join(', ') : body?.message) ||
      `API error ${res.status}`;
    throw new ApiError(res.status, message, body);
  }

  // 204 No Content
  if (res.status === 204) return { data: null } as unknown as T;

  const json = await res.json();

  // If the server returned an unwrapped payload (array, or object without a 'data' key),
  // wrap it in { data: json } so all queries and components expecting `res.data` receive it consistently.
  if (json !== null && typeof json === 'object' && !('data' in json)) {
    return { data: json } as unknown as T;
  }

  return json as T;
}
