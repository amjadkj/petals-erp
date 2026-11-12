# Page: Appointments

Route: `/appointments` · Header title: "Appointments"
Source: mockup. Module: APPOINTMENTS. Create button requires `appointments.create`; reschedule/cancel require `appointments.update`.
API: `GET /appointments?from&to&branchId&therapistId&departmentId&status` (max 31 days) · `POST /appointments` · `PUT /appointments/:id/reschedule` · `PUT /appointments/:id/cancel` (reason required) · `PUT /appointments/:id/status` · `GET /appointments/daily`.

## 1. Layout (desktop)
**Hero:** "Make room for every milestone." · sub: "Plan sessions and keep families and therapists in sync." · primary action `+ New appointment`.

**Toolbar row 1:** `‹` `›` week arrows · `Today` · date range label `02 – 08 Nov 2026` with a dropdown (mini date picker) · segmented control `Day | Week | Month` (Week active).
**Toolbar row 2:** filters `All therapists`, `All departments`, `All statuses` · legend on the right: Speech (purple dot), OT (teal dot), Cancelled (red dot).

**Calendar surface (rounded card):**
- Header row: time-zone label `IST`, then Mon to Sun with day number. Today's column highlighted (purple-50 header, purple day label).
- Left gutter: hour labels from 9:00 to 17:00 in 1 h rows (64 px per hour). Extend range by clinic hours.
- Session blocks positioned by start time and duration, content as in foundations (name, `Dept · Therapist first name`, time range). Overlapping sessions for one therapist are not possible (conflict detection), but different therapists can sit side by side, so stack by splitting column width.
- **Current-time line:** teal 2 px line across today's column with a time chip in the gutter (for example `16:30`).
- Empty day (Sunday): centred "No sessions. A little room to rest."
- Footer text: "Cancelled sessions remain visible. Select a session to see details or reschedule." · right: "All times in IST".

## 2. Session interactions
- **Click a block** opens a **side panel** (desktop) or bottom sheet (mobile) with: client (link to profile), department, therapist, room, date and time, status chip, notes link, and actions `Mark attended`, `Mark no-show`, `Reschedule`, `Cancel`.
- **Reschedule** (modal): date, start/end time, shows conflicts returned as 409 (therapist or client overlap).
- **Cancel** (modal): required reason textarea, "Parent will be notified" note, confirm. The slot then stays on the calendar with a cancelled style, and the reason shows on hover or in the panel.
- Cancelled block: red tint, strike-through client name, label "Cancelled".
- Leave/holiday-flagged sessions show a small warning icon (API flags them).

## 3. New appointment (modal)
Fields: Client (searchable, one branch), Department, Therapist (filtered by availability), Date, Start time, Duration (default 45 min from the plan), Room, optional "Repeat" link that sends the user to Schedule planning. Primary `Create appointment`, secondary `Cancel`. Shows conflict error inline.

## 4. Views
- **Week** (default), **Day** (single wide column, per-therapist columns when "All therapists"), **Month** (grid with session counts and dots; click a day to open Day view).
- Therapist role: calendar limited to own sessions, therapist filter hidden.
- Parent role: view-only, own child's sessions only, no filters beyond child.

## 5. Mobile
- Default to **Agenda/Day view**: a horizontally scrollable week strip (Mon to Sun with dots for days with sessions), below it the day's sessions as a vertical list of cards (time, client, `Dept · Therapist`, status chip).
- `Day | Week | Month` remains; Week on phones is a compact 3-day or agenda list.
- Filters go into a bottom sheet. `+ New appointment` becomes a floating action button.

## 6. States
Skeleton blocks while loading. Error with retry. Range limit message if more than 31 days requested. Offline: therapists see a read-only copy of today's schedule only.
