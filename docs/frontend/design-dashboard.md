# Page: Dashboard

Route: `/dashboard` · Header title: "Director dashboard" (Manager: "Dashboard", Therapist: "My dashboard", Parent: "Home")
Source: mockup (Director). Manager, Therapist and Parent variants derived from PRD 4.2 to 4.4 and the Phase 15 API.
API: `GET /api/v1/dashboard?branchId=<uuid|ALL>` returns a role-specific payload. Cached 60 s server side.

## 1. Director (mockup)
**Hero:** "A little progress, every day." · sub: `Wednesday, 04 Nov 2026 · Here's how your centre is doing today.` · action: `Configure widgets` (outline).

**Stat cards, 2 rows × 4:**
| Card | Value | Helper |
| --- | --- | --- |
| Today's sessions | 24 | 18 attended · 2 cancelled · 1 no-show |
| Active clients | 128 | Across 2 branches |
| New clients this month | 12 | 8 more than October |
| New leads | 18 | 6 follow-ups due today |
| Revenue this month | ₹4.2L | Today ₹18,000 · Week ₹1.05L |
| Pending payments | ₹48,000 | Advance balance ₹22,000 |
| Reports due | 7 | 3 overdue · 4 due this week |
| Staff present | 16 / 18 | 2 staff members on leave |

Currency: Indian grouping, with `L` shorthand for lakh in cards (full figures in tables).

**Widgets (2-column grid):**
1. **Therapist utilisation** (left, wide): rows of `Name · Dept · progress bar · 6.5 / 8h`. Bar: teal filled on purple-200 track. Legend Booked / Available. Sub-line "Booked hours out of 8 available today".
2. **Centre pulse** (right): three action rows, each with a numbered badge (06, 04, 02), title, hint, chevron. Lead follow-ups → `/leads` (filtered), Reports due this week → `/reports`, Leave requests → `/hrms` (Leave tab).
3. **Today's sessions** (left, wide): table `Time · Client / Therapy · Therapist · Status chip`. Link `View calendar →` to `/appointments`. Shows first rows; scroll or "View all".
4. **Overdue reports** (right): red-tinted rows with client, `Type · Therapist`, due date, `Send reminder` link (calls reminder action). `View all →` to `/reports?overdue=true`.

**Configure widgets:** opens a modal (list of widgets with switches and drag handles to reorder). Saved per user (local preference in v1).

## 2. Manager variant (derived)
Same shell and cards, **without revenue, P&L and salary**: Today's sessions, Active clients, Pending payments (count only), Staff present, Utilisation, New leads. Widgets: Today's sessions, Leads follow-ups, Leave requests, Reports due (view and follow up).

## 3. Therapist variant (derived)
- Stat cards: Total clients handled, Today's schedule count, Pending reports, Goals needing update.
- Widgets: **Today's schedule** (own sessions, tap to open client), **Upcoming sessions**, **Pending reports** (link to report editor).
- Only own data. This is the one view shown offline (read-only today's schedule).

## 4. Parent variant (derived)
- Child switcher at top if more than one child.
- Cards: Total sessions attended, Today's session (time and therapist, or "No session today").
- Widget: Upcoming sessions (top 10). Shared reports shortcut. Payment status chip (Paid / Pending / Advance).

## 5. Responsive
- Desktop: 4-column stat grid, widgets in 2 columns.
- Tablet: 2-column stats, widgets single column.
- Phone: stat cards 2 per row (numbers scale down), widgets stack, tables become card lists, "Configure widgets" moves into an overflow menu.

## 6. States
Loading skeletons per card. Per-widget error with retry (one failing widget doesn't blank the page). Empty text: "Nothing needs attention right now."
