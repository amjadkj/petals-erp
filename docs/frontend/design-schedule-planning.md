# Page: Schedule planning

Route: `/schedule-planning` · Header title: "Schedule planning"
Source: **derived from PRD 4.1.7 and the API (no mockup supplied)**. Director only by default.
API: `POST /schedules` (recurring, generates an 8-week rolling window) · `POST /appointments` · `PUT /appointments/:id/reschedule|cancel` · `GET /hr/holidays` · `GET /hr/leaves`.

## 1. Layout
**Hero:** encouraging headline (for example "Plan once. Care all term.") with `+ New schedule` primary action.
**Stat cards:** Active schedules · Sessions generated this week · Conflicts to resolve · Sessions affected by leave.
**Filters:** client search, therapist, department, room, status.

## 2. Main surfaces (tabs)
1. **Schedules**: table of recurring schedules: client, department, therapist, rule in words ("Mon, Wed, Fri · 4:00 pm"), duration, starts/ends, status. Row action: edit, pause, end.
2. **Availability**: therapist × time grid showing booked (purple), free (white), leave/holiday (hatched grey), room usage toggle. Same visual language as the Appointments calendar.
3. **Needs attention**: list of sessions flagged by approved leave or holidays, with `Reschedule` and `Cancel (with reason)` actions per row and bulk reschedule.

## 3. New schedule (modal, 2 steps on phones)
Fields: Client, Treatment plan (prefills department, therapist, duration), Days of week (chips Mon to Sun), Start time, Duration, Room, Starts on, Ends on (optional).
- Live preview of the next 8 dates. Conflicts (therapist, client, room) shown inline before saving, using the 409 response details.
- `Create schedule` generates the rolling window; show a toast "24 sessions created".

## 4. Rules
- Conflicts are blocked, not warned: therapist double-booking, client overlap.
- A therapist working in two branches sees one combined availability; the grid marks the other branch as "Busy at Whitefield".
- Leave/holiday auto-flags affected sessions (API does this on approval).

## 5. Mobile
Tabs become a select. Schedules become cards. Availability grid is replaced by a per-therapist list with a date picker. New schedule uses a bottom-sheet stepper.
