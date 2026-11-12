# Page: Login and auth screens

Routes: `/login`, `/login/2fa`, `/login/otp`, `/forgot-password` · No sidebar or header (these are the only pages outside the app shell).
Source: **derived from PRD 13.3 and the Phase 03 API (no mockup supplied)**. Use foundations tokens: white card, 12 px radius, Petals logo on top, purple primary button.
API: `POST /auth/login` · `POST /auth/2fa/verify-login` · `POST /auth/otp/request` · `POST /auth/otp/verify` · `POST /auth/refresh` · `POST /auth/logout` · `POST /auth/change-password` · `/auth/2fa/setup|enable|disable` · `GET /auth/me`.

## 1. Staff login (`/login`)
Centred card (max 420 px) on a soft purple-50 background. Logo + "CHILD DEVELOPMENT CENTRE". Headline in Quicksand ("Welcome back."). Fields: Email, Password (show/hide). `Sign in` primary. Links: `Forgot password?`, `Parent? Sign in with OTP`.
- Lockout after 5 failed attempts: show countdown from `Retry-After`.
- If 2FA is required (always for the Director), go to `/login/2fa`.

## 2. 2FA (`/login/2fa`)
6-digit code input (auto-advance, paste support). `Verify`. Uses `tempToken` from the first step.
- First-time Director: setup screen shows a QR code and manual key, then code confirmation (`/auth/2fa/setup`, `/enable`).

## 3. Parent OTP (`/login/otp`)
Step 1: phone or email input → `Send code`. Step 2: 6-digit OTP, resend timer, 5-attempt limit message. After success go to the Parent dashboard.

## 4. Session behaviour
- Access token in memory; refresh via httpOnly cookie plus CSRF header. Revoked session returns to `/login` with a notice.
- Logout clears service-worker caches and local storage.
- `Change password` and 2FA management live under the user menu.

## 5. Mobile
Full-bleed layout, card without border, 16 px padding, inputs 44 px tall, numeric keypad for OTP (`inputmode="numeric"`, `autocomplete="one-time-code"`).
