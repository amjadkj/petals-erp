# Page: HRMS (Attendance · Leave · Holiday calendar)

Route: `/hrms` with tabs `/hrms/attendance`, `/hrms/leave`, `/hrms/holidays` · Header title: "HRMS"
Source: mockups (Attendance, Leave). Holiday calendar tab combines the calendar card from the Leave mockup. Module: HRMS.
API: `POST /hr/attendance/check-in|check-out` · `GET /hr/attendance/daily?date&branchId` · `GET /hr/attendance/monthly?branchId&year&month` · `GET/POST /hr/leaves` · `POST /hr/leaves/:id/approve|reject` · `POST /hr/director/availability` · `GET/POST /hr/holidays` · `DELETE /hr/holidays/:id`.

## 1. Common header
Tabs under the hero: `Attendance | Leave | Holiday calendar` (underline tabs).

## 2. Attendance tab (mockup)
**Hero:** "A supported team. Better care." · sub: `Wednesday, 04 Nov 2026 · Your check-in: 09:02 AM · Indiranagar` · actions `Manual entry` (outline, modal), `Check out` (primary). If not yet checked in, the primary becomes `Check in`.

**Stat cards (4):** Present today 16 ("Out of 18 team members") · On leave 2 · Late check-ins 1 ("After the 09:30 AM start") · Leave requests 2 ("Awaiting Director approval").

**Filters:** search team members · date picker · `All departments` · segmented `Daily | Monthly | Sessions` (Daily active).

**Staff attendance card:** title + `Export attendance ↓`. Table: Employee · Role · Department · Check-in · Check-out · Hours · Status chip (Present, Late with amber time, On leave). Rows for people on leave show `—`. Footer: `Showing 1–8 of 18 team members` + pagination.
- **Monthly:** grid (employees × days) with P / L / A / H marks and month totals. Built from one aggregate call.
- **Sessions:** client session attendance (attended, no-show, cancelled) per therapist.
- **Manual entry** (modal): Employee, Date, Check-in, Check-out, reason. Biometric integration comes later.

## 3. Leave tab (mockup)
**Hero:** "Time to recharge. Space to plan." · sub: "Manage leave fairly and keep every care team covered." · actions `Export leave` (outline), `Apply for leave` (primary).

**Balance cards (4):** Casual leave 6 days ("Your balance · 6 of 12 remaining") · Sick leave 8 days · Earned leave 12 days · Pending requests 2 ("Director approval required").

**Left card, Leave requests:** filter `All requests` select. Table: Employee · Leave type · Dates · Days · Status chip. Under the name a muted line: `Personal commitment · Requested 03 Nov`. Pending rows show `Approve` (teal outline) and `Reject` (outline) buttons in the status column. Approved rows show `Approved by Priya Nair · 03 Nov`. Footer: "Showing all 4 requests this month".
**Right card, Holiday calendar:** month grid with prev/next, today highlighted purple, holidays teal, list of upcoming (`08 Nov · Diwali · All branches closed`, `20 Nov · Staff training · Indiranagar · No client sessions`).

**Bottom note (purple-50):** "Clear approvals, consistent coverage. Director approves leave. Nikhil Kumar (Manager) is the backup approver only when the Director is unavailable. Approve or reject with a comment; affected appointments are flagged for rescheduling."

**Apply for leave** (modal): Leave type (Casual, Sick, Paid, Unpaid, Other), From, To, computed days, Reason, shows remaining balance. `Cancel` / `Submit request`.
**Approve / Reject** (small modal): optional decision note (required for Reject). After approval, a toast shows "N appointments flagged for rescheduling" with a link to Schedule planning (Needs attention).
- Director only: an "I'm away until…" control (availability) so the Manager can act as backup. Managers see Approve/Reject only while the Director is marked away.
- Therapists see only their own requests, balances and attendance. They can apply, not approve.

## 4. Holiday calendar tab
Full-width month calendar plus list. `+ Add holiday` (modal: date, name, branch or all branches). Director and branch Manager can add/delete.

## 5. Mobile
Tabs scroll horizontally. Attendance and leave tables become cards (name, status chip, times/dates, action buttons full width). Calendar card moves below requests. Manual entry and Apply leave are bottom sheets. Monthly grid scrolls horizontally with a sticky employee column.
