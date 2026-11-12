import { fetcher } from './fetcher';
import type { ApiResponse, UserSummary } from '@petals/types';

export interface LoginResult {
  accessToken?: string;
  tempToken?: string;
  requires2FA?: boolean;
  user?: UserSummary;
}

export const authApi = {
  login: (email: string, password: string) =>
    fetcher<ApiResponse<LoginResult>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  verify2fa: (tempToken: string, code: string) =>
    fetcher<ApiResponse<LoginResult>>('/auth/2fa/verify-login', {
      method: 'POST',
      body: JSON.stringify({ tempToken, code }),
    }),

  requestOtp: (contact: string) =>
    fetcher<ApiResponse<{ message: string }>>('/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify({ contact }),
    }),

  verifyOtp: (contact: string, code: string) =>
    fetcher<ApiResponse<LoginResult>>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ contact, code }),
    }),

  refresh: () =>
    fetcher<ApiResponse<{ accessToken: string }>>('/auth/refresh', {
      method: 'POST',
    }),

  logout: () =>
    fetcher<ApiResponse<{ message: string }>>('/auth/logout', {
      method: 'POST',
    }),

  getMe: () =>
    fetcher<ApiResponse<UserSummary>>('/auth/me'),

  setup2fa: () =>
    fetcher<ApiResponse<{ qrCode: string; manualKey: string }>>('/auth/2fa/setup', {
      method: 'POST',
    }),

  enable2fa: (code: string) =>
    fetcher<ApiResponse<{ message: string }>>('/auth/2fa/enable', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  disable2fa: (code: string) =>
    fetcher<ApiResponse<{ message: string }>>('/auth/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  changePassword: (oldPassword: string, newPassword: string) =>
    fetcher<ApiResponse<{ message: string }>>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    }),
};
