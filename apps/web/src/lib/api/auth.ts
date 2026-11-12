import { fetcher } from './fetcher';
import type { UserSummary } from '@petals/types';

export interface LoginResult {
  accessToken?: string;
  tempToken?: string;
  requires2FA?: boolean;
  user?: UserSummary;
}

export const authApi = {
  login: (email: string, password: string) =>
    fetcher<LoginResult>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  verify2fa: (tempToken: string, code: string) =>
    fetcher<LoginResult>('/auth/2fa/verify-login', {
      method: 'POST',
      body: JSON.stringify({ tempToken, code }),
    }),

  requestOtp: (target: string, purpose: string = 'LOGIN') =>
    fetcher<{ message: string }>('/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify({ target, purpose }),
    }),

  verifyOtp: (target: string, code: string, purpose: string = 'LOGIN') =>
    fetcher<LoginResult>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ target, code, purpose }),
    }),

  refresh: () =>
    fetcher<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
    }),

  logout: () =>
    fetcher<{ message: string }>('/auth/logout', {
      method: 'POST',
    }),

  getMe: () =>
    fetcher<UserSummary>('/auth/me'),

  setup2fa: () =>
    fetcher<{ qrCode: string; manualKey: string }>('/auth/2fa/setup', {
      method: 'POST',
    }),

  enable2fa: (code: string) =>
    fetcher<{ message: string }>('/auth/2fa/enable', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  disable2fa: (code: string) =>
    fetcher<{ message: string }>('/auth/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  changePassword: (oldPassword: string, newPassword: string) =>
    fetcher<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    }),
};
