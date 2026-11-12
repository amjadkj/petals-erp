# Petals ERP Frontend Progress Log

## Phase A: Foundation, Shell, Auth, Shared UI & PWA Setup
- **Status:** Complete
- **Date:** 2026-11-12
- **Scope:** `apps/web`

### 1. What was built:
- **Design Foundations & Tokens:**
  - Tailwind CSS 3 configuration with exact color tokens (Purple, Teal, Ink, Semantic danger/warning/success).
  - PostCSS configuration with Autoprefixer.
  - Global styles (`src/styles/globals.css`) with Quicksand and Inter font variables, safe-area insets.
  - Root layout (`src/app/layout.tsx`) self-hosting Quicksand (weights 600, 700) and Inter (weights 400, 500, 600).
  - React Query provider & custom Toast notification provider.
- **PWA Setup:**
  - Web App Manifest (`public/manifest.json`) standalone mode, `#6C3995` theme color.
  - High-res icons in SVG & PNG format (`192x192`, `512x512`, `maskable 512x512`).
  - `@serwist/next` configured in `next.config.ts`.
  - Service worker (`src/app/sw.ts`) with app shell precaching and runtime caching.
  - Install prompt banner component (`InstallBanner.tsx`) with second-visit detection.
  - Offline detector bar (`OfflineBanner.tsx`).
- **Core Library & Typed API Client (`src/lib/`):**
  - Base fetcher (`fetcher.ts`) with CSRF token handling, in-memory bearer token, automatic silent refresh on 401, active branch query injection, and permission error interception.
  - API modules: `auth.ts`, `clients.ts`, `appointments.ts`, `finance.ts`, `leads.ts`, `hr.ts`, `employees.ts`, `communication.ts`, `reports.ts`, `access.ts`, `branches.ts`, `dashboard.ts`, `schedules.ts`.
  - Auth session state in-memory (`session.ts`), CSRF cookie utility (`csrf.ts`), route guard (`guards.tsx`).
  - Zustand permission store (`permissions/store.ts`) with localStorage persistence for branch and sidebar state.
  - RBAC hook (`usePermissions.ts`), conditional render component (`Can.tsx`), and dynamic navigation builder (`navBuilder.ts`).
- **Shared UI Component System (`src/components/ui/`):**
  - Button (primary, teal, outline; 44px min-touch)
  - StatusChip (all states: attended, scheduled, pending, cancelled, advance, paid, etc.)
  - StatCard (Quicksand 32px metrics, skeleton state)
  - Input, Select, DatePicker, Checkbox, Switch
  - Tabs, SegmentedControl
  - DataTable (responsive: table view on desktop, card view on mobile; offset pagination)
  - Modal (centred desktop, BottomSheet on mobile)
  - BottomSheet, FilterBar, FiltersSheet, Toast
  - EmptyState, Skeleton, Avatar, ConfirmDialog, Drawer, Badge, Tooltip, Popover, ProgressBar
- **App Shell Components (`src/components/shell/`):**
  - Sidebar: collapsible 240px to 72px icon rail with keyboard shortcut `[`, brand logo, workspace nav, user card.
  - Header: sticky 88px desktop / 64px mobile, page title hook integration, BranchSwitcher, GlobalSearch with `Ctrl+K` shortcut, NotificationsPopover, UserMenu.
  - MobileDrawer: responsive off-canvas menu for mobile viewports.
  - InactivityLock: 15-minute idle detection overlay with re-authentication.
- **Route Skeleton (`src/app/`):**
  - Auth routes: full implementations for `/login`, `/login/2fa`, `/login/otp`.
  - Authenticated layout `(app)/layout.tsx` wrapping all subpages in the unified shell.
  - Placeholder pages for all 11 modules: dashboard, appointments, clients, schedule planning, financial, communication, leads, hrms, employees, reports, role-access, plus audit log and dynamic detail pages (`clients/[id]`, `employees/[id]`, `reports/[id]`).
  - Custom friendly 404 (`not-found.tsx`) and 403 (`403.tsx` and `403/page.tsx`).
- **Testing & Tooling:**
  - Vitest + JSDOM test suite covering core UI primitives (`Button`, `StatusChip`, `StatCard`, `DataTable`).
  - Playwright configuration with desktop and iPhone viewports.

### 2. Test & Verification Status:
- TypeScript (`tsc --noEmit`): Clean (0 errors)
- ESLint (`eslint`): Clean (0 errors, 0 warnings)
- Vitest unit tests: 16/16 Passing across 4 test suites
- Next.js production build (`next build`): Success (20 routes compiled, PWA sw bundled)
- Commit Hash: `a98b717`
