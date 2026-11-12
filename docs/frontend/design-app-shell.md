# App Shell: Sidebar and Header

Applies to **every authenticated page**. Only the content area below the header changes between routes. Source: sidebar and header visible on all mockups.

## 1. Structure
```
┌───────────┬──────────────────────────────────────────────┐
│           │ HEADER (sticky)                              │
│  SIDEBAR  ├──────────────────────────────────────────────┤
│ (sticky)  │                                              │
│           │  PAGE CONTENT (scrolls, swaps per route)     │
│           │                                              │
└───────────┴──────────────────────────────────────────────┘
```
- Next.js App Router: `app/(app)/layout.tsx` renders `<Sidebar/>` and `<Header/>` once. Each page is `children`. The shell never remounts on navigation.
- Sidebar and header stay fixed while the content scrolls. Only the content area scrolls.

## 2. Sidebar (sticky, collapsible)

### Expanded (240 px)
- **Top:** Petals logo + "CHILD DEVELOPMENT CENTRE" caption.
- **Section label:** `WORKSPACE` (small, muted, uppercase).
- **Nav items** (icon + label, 44 px row, 8 px radius):
  1. Dashboard
  2. Appointments
  3. Clients
  4. Schedule planning
  5. Financial
  6. Communication
  7. Leads
  8. HRMS
  9. Employees
  10. Reports
  11. Role access
- Active item: purple-600 fill, white icon and text. Hover: purple-50.
- **Bottom block (pinned):**
  - `Help & support` (purple-50 pill button with icon).
  - Divider, then user card: avatar initials, name, role (`Priya Nair / Director`), chevron opening a menu (Profile, Change password, 2FA settings, Install app, Sign out).

### Collapsed (icon rail, 72 px)
- Toggle button collapses the sidebar so **only the SVG icons show**.
- Logo shrinks to the mark only. Section label, text labels, help text and user name are hidden.
- Each icon has a tooltip (label) on hover/focus and `aria-label`.
- Active item keeps the purple fill (square pill).
- Bottom: help icon and user avatar only. Avatar click opens the same menu.
- Width animates 240 → 72 px (150 ms ease); content area expands to fill.

### Toggle behaviour
- Toggle control: a small chevron button on the sidebar's right edge (desktop) that flips direction.
- State persisted in `localStorage` (`petals.sidebar = expanded | collapsed`) and read before first paint to avoid flicker.
- Default: expanded ≥ 1200 px, collapsed 768–1199 px.
- Keyboard shortcut: `[` toggles.

### Permission-driven items
- The nav is built from `GET /api/v1/access/me/permissions`. A module with `enabled = false` for the user is **removed** (not greyed).
- Default visibility by role:
  - Director: all 11.
  - Manager: Dashboard, Appointments, Clients, Financial, Communication, Leads, HRMS, Employees, Reports.
  - Therapist: Dashboard, Appointments, Clients, HRMS, Reports.
  - Parent: Dashboard, Appointments (schedule), Child profile, Reports.
- Role access is Director only. Schedule planning is Director only by default.
- Parent role uses a simplified nav (see `design-dashboard.md`, section Parent).

## 3. Header (on every page)
Left to right:
1. **Page title** of the current route (Quicksand, purple, for example "Appointments", "Director dashboard", "Clients", "Branches" / "Role access").
2. **Branch switcher** (outline select, building icon): `All Branches` plus each branch. Director sees "All Branches" (`branchId=ALL`). Users with one branch see a static label, no dropdown.
3. **Search** ("Search Petals…"): global search across clients, employees, leads (limited to what the user may view). Opens a results popover. `/` or `Cmd/Ctrl+K` focuses it.
4. **Notification bell** with count badge (teal, example "3"). Opens a popover listing report-due, leave, payment-due, session reminder items, with "Mark all read".
5. **User chip:** name + avatar initials + chevron (same menu as the sidebar user card).

- Height 88 px on desktop (mockup), 64 px on phones. White, 1 px bottom border, sticky at top.
- The selected branch is held in a global store, sent as `branchId` on API calls, and persisted per user.

## 4. Mobile shell (< 768 px)
- Sidebar becomes an **off-canvas drawer** (full-height, 280 px, scrim behind). Opened by a hamburger at the far left of the header. Closes on route change, scrim tap, or swipe left.
- Drawer always shows labels (no icon-rail on phones). Same item order, same bottom block.
- Header compresses to one row of 64 px:
  `☰  Page title  …  [branch icon-button]  [search icon]  [bell]  [avatar]`
  - Branch icon opens a bottom sheet with branch list.
  - Search icon expands to a full-width search overlay.
  - User name text is hidden, avatar only.
- Optional bottom tab bar for Therapist and Parent (max 4 to 5 items: Dashboard, Schedule, Clients, Reports, More). Directors and Managers use the drawer only.
- Content padding 16 px; modals become bottom sheets.

## 5. Page content wrapper
Every page's content area starts with the same hero block:
- **Headline** (Quicksand, purple, about 28 px, encouraging phrase) + **sub-line** (muted).
- **Right-aligned page actions** (for example `Export`, `+ Add client`). They wrap below the headline on phones.
- Then optional tabs, stat cards, filters, main surface.

## 6. Global behaviours
- **Auth guard:** unauthenticated users go to `/login`. 401 triggers refresh (`/auth/refresh` with CSRF); failure signs out and clears caches.
- **403 page:** friendly "You don't have access to this" with a back button.
- **Inactivity auto-lock** overlay, then PIN/password re-entry.
- **Offline banner** (thin bar under header) when `navigator.onLine` is false; non-cached pages show an "Offline" empty state.
- **Install banner** for PWA.
- Breadcrumbs only on detail pages (for example `← Employees / Anu Menon`).
