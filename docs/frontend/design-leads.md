# Page: Leads

Route: `/leads` · Header title: "Leads"
Source: mockup (Board view). List view derived. Module: LEADS.
API: `GET /leads` · `GET /leads/board` (stage counts, max 20 cards per column, per-column cursor) · `POST /leads` · `PATCH /leads/:id` · `GET /leads/:id/convert-preview` · `POST /leads/:id/convert` · `POST /leads/check-follow-ups`. Lead DTOs are empty in the OpenAPI export; confirm fields (name, contact, child age, concern, source, owner, follow-up date).

## 1. Layout (desktop)
**Hero:** "Every enquiry is a new beginning." · sub: "Nurture family enquiries from the first hello to their first session." · actions `Export` (outline), `+ New lead` (primary).

**Stat cards (4):** New leads this month 18 · Active pipeline 14 ("New · Contacted · Assessment") · Converted this month 3 · Follow-ups due 6 ("2 overdue · 4 due today").

**Filter bar:** search · `All sources` · `All owners` · `Follow-up date` · segmented `Board | List` (Board active).

## 2. Board view
Five columns, equal width, each in a rounded card with a header: coloured dot, stage name, count badge.

| Stage | Dot colour | Count shown |
| --- | --- | --- |
| New | purple | 5 |
| Contacted | teal | 5 |
| Assessment scheduled | purple | 4 |
| Converted | teal | 3 |
| Lost | grey | 1 |

**Lead card:** child's name (bold), `Child · 5 years`, concern ("Speech delay"), `Source: Website`, owner avatar chip (`NK Nikhil`), footer `Follow-up · 05 Nov 2026`.
- **Overdue:** red border and red footer band, `Overdue · 03 Nov 2026`.
- **Converted:** teal footer band, `Converted · 04 Nov 2026`.
- **Lost:** purple-50 footer band, `Closed · 02 Nov 2026`, and an empty-state note in the column: "Closed with care. Family chose another centre."
- Each column shows the first few cards, then a `View N more leads` button (loads the next cursor page).

**Interactions**
- Drag a card between columns (desktop) or use `Move to…` in the card menu (mobile). Dragging to **Converted is not allowed**: the API rejects a plain stage change. Dropping there opens the Convert flow instead.
- Click a card opens a detail drawer (contact, concern, source, notes timeline, owner, follow-up date, actions `Edit`, `Log follow-up`, `Convert to client`, `Mark lost`).

## 3. Modals
- **New lead** (modal): Child's name, Child age, Guardian name, Mobile, Email, Concern, Source (Website, Referral, School referral, Instagram, Paediatrician, Walk-in, Other), Branch, Owner, Follow-up date. `Cancel` / `Create lead`.
- **Convert to client** (modal, uses convert-preview): prefilled child name, estimated DOB (editable), branch, guardian contact, case history draft, department, consent checkbox. Primary `Convert and create profile`. Success navigates to the new client profile. Double conversion shows a 409 message.
- **Mark lost** (small modal): reason select + notes.

## 4. List view
Table: Child, Age, Concern, Source, Owner, Stage chip, Follow-up date, chevron. Same filters. Overdue follow-ups tinted.

## 5. Mobile
Board becomes horizontally scrollable columns (snap, one column per view, stage tabs on top with counts). Alternatively a stage dropdown plus a single list. `+ New lead` as floating button. Drawers are bottom sheets.
