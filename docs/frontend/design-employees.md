# Page: Employees (list and detail)

Routes: `/employees` and `/employees/[id]` · Header title: "Employees"
Source: mockups (list, and detail with Performance tab). Module: EMPLOYEES; salary is a separate sub-module EMPLOYEE_SALARY.
API: `GET /employees` · `POST /employees` · `PATCH /employees/:id` · `GET /users` · `GET /hr/employees/:id/summary` · `/goals` · `/activity-log`. Employee/User DTOs are empty in the OpenAPI export; confirm fields before building forms.

## 1. List (mockup)
**Hero:** "The people behind every milestone." · sub: "Support your team, understand their workload, and celebrate their impact." · actions `Export` (outline), `+ Add employee` (primary).

**Stat cards (4):** Team members 18 ("Across 2 branches") · Therapists 14 ("6 Speech · 5 OT · 3 Behaviour") · Front office 3 · On leave today 2 ("16 staff members present").

**Filters:** search · `All roles` · `All departments` · `All statuses`.

**"Our team" card:** right label "Director access · Salary visible". Table: Employee (avatar, name, code `PTL-E002`) · Role · Department · Branch · **Salary / month** (with a lock icon in the header) · Status chip · chevron. Footer: pagination.
- Salary column renders only with `EMPLOYEE_SALARY:view`; otherwise the column is removed entirely (the API masks it).
- Bottom note (purple-50): "Salary is visible only with Employees salary permission. Managers without this permission do not see the salary column."
- Row click opens the detail page.

## 2. Add employee (modal)
Name, Email, Mobile, Role (Therapist, Manager, Coordinator, …), Department, Branch(es), Joining date, Employee code (auto), Monthly salary (field shown only with salary permission). `Cancel` / `Add employee`. Creating the user account triggers an invite.

## 3. Detail page (mockup)
- Breadcrumb `← Employees / Anu Menon`.
- **Profile card:** avatar, name, `Speech therapist · PTL-E002 · Indiranagar`, email, `Joined 15 Jun 2023`, Active chip, `Edit profile` (outline, modal), `Monthly salary ₹55,000` (only with permission).
- **Tabs:** Overview · Reports submitted · Activity log · Sessions conducted · Assigned cases · **Performance** (active in mockup).

**Performance tab**
- Stat cards: Sessions completed 108 ("114 scheduled · 94.7% completed") · Report timeliness 92% ("11 of 12 on time") · Attendance 96% ("24 of 25 working days") · Assigned clients 18 ("12 primary · 6 shared").
- **Session completion trend:** area/line chart, last 5 weeks, 0 to 100%, teal line on teal-50 fill, data labels on points.
- **Care quality snapshot:** three teal progress bars (Goals updated on time 94%, Parent reports shared 88%, Session notes complete 98%).
- **Assigned cases:** list with client name, status chip (for example "Improving"), long-term goal link, daily/weekly sub-goal text, response and remarks. `View all 18 →`.
- **Recent activity:** timeline of dated entries (what, client, detail).

**Other tabs:** Overview (profile details), Reports submitted (table with status and on-time flag), Activity log (everything the employee entered, cursor paginated), Sessions conducted (table), Assigned cases (full list with goals, sub-goals, response, remarks, progress).

## 4. Mobile
List rows become cards (avatar, name, role · dept, branch, salary if allowed, status chip). Detail tabs scroll horizontally; charts shrink to full width, 3 to 5 labels only. Edit profile and Add employee are bottom sheets.
