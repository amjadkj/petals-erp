# Page: Financial (Payments)

Route: `/financial` (sub-routes `/financial/payments`, `/financial/pnl`) · Sidebar label: "Financial" · Header title in the mockup: "Payments"
Source: mockup (Payments). Revenue, P&L and expense views are derived from PRD 4.1.5 and the Phase 10 API.
Modules: FINANCIAL (payments, due, monthly tracking), FINANCIAL_PNL (P&L, a separate sub-module toggle).
API: `GET /finance/payments` · `GET /finance/invoices` · `POST /finance/invoices` · `POST /finance/invoices/:id/payments` · `GET /finance/payments-due` · `GET /finance/monthly-tracking?month` · `GET/POST /finance/expenses` · `GET /finance/pnl` · `GET /finance/revenue` · `/revenue-by-category` · `/revenue-by-department` · `POST /finance/export` (background job, 10/hr).

## 1. Payments view (mockup)
**Hero:** "Clear balances. Continued care." · sub: "Track payments, issue receipts, and follow up with care." · actions `Export` (outline), `Record payment` (**teal** primary, the only teal CTA in the mockups).

**Stat cards (4):** Paid this month ₹3.72L · Pending payments ₹48,000 ("12 families · 3 overdue") · Advance balance ₹22,000 · Received this week ₹1.05L ("+8% vs last week").

**Filters:** search (client or receipt) · date range (`01 – 30 Nov 2026`) · payment method (Cash, UPI, Card, Bank transfer) · status.

**Table card:**
- Tabs: `All payments`, `Pending`, `Advance` · month label on the right.
- Columns: Client · Date · Amount · Method · Status chip (Paid / Advance / Pending) · Receipt (`PTL-1028` link) · action (`↓ PDF` for paid, `Remind` for pending).
- Footer: `Showing 1–6 of 42 payments` + pagination.
- Pending rows show `—` for method and receipt.

**"A gentle reminder can help." panel:** up to 3 overdue cards (client, `₹3,000 · Due 31 Oct 2026`, `Send reminder`). Header right: "3 overdue accounts". `Send reminder` sends the approved WhatsApp template "payment due" via Communication and logs it.

## 2. Record payment (modal)
Fields: Client (search), Invoice (open invoices for that client, with balance), Amount, Method (Cash / UPI / Card / Bank transfer), Paid on (default now), Receipt number (auto, read-only), Notes. Primary `Record payment`, secondary `Cancel`.
- On success: invoice status updates (Pending → Paid, overpayment → Advance); offer `Download receipt` in the toast.
- Allow `Create invoice` from the same modal (link) for new billing: revenue category (Clinical therapy / Assessment & evaluation fee), amount, issued, due.

## 3. Additional tabs (derived)
- **Overview/Revenue:** revenue by day / week / month (chart + table), by category, by department. Filters by date, department, therapist, branch.
- **P&L** (only with `FINANCIAL_PNL`): month selector, revenue vs expenses, margin %, per-branch and consolidated. Never shown to Managers by default.
- **Expenses:** table plus `+ Add expense` modal (branch, category, amount, date, notes). Category is a combobox with free text until the clinic decides on a fixed list.
- **Monthly tracking:** billed, collected, pending balance per month.

## 4. Role behaviour
- Director: everything. Manager: payments, due list, monthly tracking only; no P&L or salary. Therapist: module off. Parent: no module; sees payment status chip only on the child profile.

## 5. Mobile
Stat cards 2-up. Table rows become cards: client, amount (bold), date, method, status chip, receipt/remind action. Filters in a bottom sheet. `Record payment` as a floating teal button. Reminder panel becomes a horizontally scrollable list.

## 6. Notes
Export is asynchronous (202): show "Preparing your file…" and notify when ready. Money is formatted in INR with Indian digit grouping.
