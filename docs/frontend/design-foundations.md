# Petals ERP: Design Foundations

Source: design foundations mockup. Shared by every page file. Values marked (est.) were read from the mockups and should be confirmed against the Figma source.

## 1. Principles
- White surfaces, 8 px grid, 12 px card radius, **no shadows** (use 1 px borders instead).
- Warm, encouraging microcopy in page headlines ("Make room for every milestone.").
- Visible focus on everything interactive: 2 px Purple 200 ring.
- Minimum touch target: 44 px, on desktop and mobile.
- The server is the authority on permissions. The UI hides what `/access/me/permissions` says is off.

## 2. Colour tokens

| Token | Hex | Use |
| --- | --- | --- |
| `--purple-600` (brand) | `#6C3995` | Primary buttons, titles, active nav, links |
| `--purple-800` | `#4A2568` | Button hover, Scheduled chip text |
| `--purple-50` | `#F5EFFA` | Table headers, soft surfaces, Speech session block |
| `--purple-100` | `#E6D8F1` | Avatars, Scheduled chip background |
| `--purple-200` | `#CDB1E3` | Focus ring, unused utilisation track |
| `--teal-500` | `#00B9B4` | Secondary button, OT accent, progress bars |
| `--teal-700` | `#007D7A` | Teal hover, positive helper text, Advance chip text |
| `--teal-50` | `#E0F7F6` | OT session block, Advance chip bg, info banners |
| `--teal-200` | `#B3EBE9` | Teal borders, converted lead footer |
| `--ink` | `#232323` | Body text |
| `--danger-*` (est.) | bg `#FCE4E6`, text/border `#B4414F` | Cancelled, overdue |
| `--warning-*` (est.) | bg `#FFF1CC`, text `#8A5A00` | Pending, Late |
| `--success-*` (est.) | bg `#E3F4E8`, text `#1E6B3A` | Attended, Paid, Present, Active |

Dark mode is not in the mockups, so it is out of scope for v1.

## 3. Typography
- **Headings, page titles, card numbers:** Quicksand Bold, purple-600.
- **Body:** Inter 16 / 14. **Table column labels:** Inter 12, uppercase, tracked, muted.
- Load both through `next/font` (self-hosted, so they work offline in the PWA).
- Page headline (H1 in content area) about 28 px; header page name about 24 px; stat number about 32 px.

## 4. Components

### Buttons
| Variant | Default | Hover | Disabled |
| --- | --- | --- | --- |
| Primary | bg purple-600, white text | purple-800 | grey bg `#EEEBF1`, grey text |
| Secondary (teal) | bg teal-500, dark text | teal-700 | grey |
| Outline | white bg, purple border + text | purple-50 bg | grey bg, grey border |
- Height 44 px, radius 8 px. `+` prefix for create actions (`+ Add client`, `+ New lead`).

### Status chips (pill, 12–13 px text)
Attended, Scheduled, Pending, Cancelled, Paid, Advance, plus Active, Present, Late, On leave, Approved. Colours: Attended / Paid / Active / Present / Approved = success; Scheduled / On leave = purple-100; Pending / Late = warning; Cancelled / Overdue = danger; Advance = teal-50.

### Inputs
- White, 1 px border `#D9D4DE` (est.), radius 8 px, 44 px height, leading icon where relevant.
- Focus: border purple + 2 px purple-200 ring. Required fields marked `*`. Selects use a trailing chevron.

### Stat card
White, 1 px border, 12 px radius, label (muted 14), value (Quicksand 32, purple), helper line (teal-700, 12–13). Used 4 per row on desktop, 2 on tablet, 1 to 2 on phone.

### Session block (calendar)
Left 3 px accent bar plus tinted fill: Speech = purple, OT = teal, Cancelled = red with strike-through client name. Content: client name (bold), `Dept · Therapist first name`, time range.

### Data table
Header row purple-50, 12 px uppercase labels, 48 px rows, hairline row dividers, trailing chevron for row navigation, offset pagination footer (`Showing 1–10 of 128`, numbered pages with ellipsis). On phones it becomes a **card list** (see section 6).

### Tabs
Underline tabs (purple 2 px on active). Segmented control (Day / Week / Month, Board / List, Daily / Monthly / Sessions) uses a purple-50 pill on the active item.

### Modal
- Used for **small create / edit forms** (Add client, Record payment, Apply for leave, New lead, Create branch, Assign users, Add employee, Manual entry).
- Desktop: centred, 480 px wide, header (title + close X), scrollable body, sticky footer with `Cancel` (outline) and the primary action.
- Mobile: becomes a **bottom sheet** (full width, 90% max height, drag handle, same sticky footer).
- Large flows (client profile, treatment plan builder, report editor) are full pages, not modals.
- Focus trap, `Esc` to close, return focus to the trigger, confirm before discarding a dirty form.

### Toasts and banners
- Toast bottom-right (desktop) or bottom-centre (mobile) for success/error.
- Info banners use teal-50 (success/info) or purple-50 (explanatory) with a bold lead-in line.

### Empty states
Soft, encouraging one-liner plus a hint, for example "No sessions. A little room to rest."

## 5. Layout and breakpoints
| Name | Width | Shell behaviour |
| --- | --- | --- |
| `sm` (phone) | < 768 px | Sidebar is an off-canvas drawer; content single column |
| `md` (tablet) | 768–1199 px | Sidebar collapsed to icon rail by default |
| `lg` (desktop) | ≥ 1200 px | Sidebar expanded (240 px) |
- Content max width: fluid with 32 px side padding on desktop, 16 px on phones.
- 8 px spacing scale: 4, 8, 16, 24, 32, 48.

## 6. Mobile patterns (apply to every page)
- Stat card grids collapse to 2 columns (phone) with horizontal scroll avoided.
- Tables become cards: primary field as title, status chip top-right, 2–3 secondary fields in rows.
- Filter bars collapse to a single `Filters` button opening a bottom sheet; search stays visible.
- Kanban (Leads) becomes horizontally scrollable columns with snap, or a stage dropdown plus a single list.
- Weekly calendar becomes a **day / agenda view** with a week strip on top.
- Primary action (`+ New …`) moves to a floating action button when the page header would crowd.

## 7. PWA rules
- Manifest, icons (192, 512, maskable), splash screens, `display: standalone`, theme colour `#6C3995`.
- Service worker caches the app shell, fonts and static assets only.
- Offline scope v1: app shell plus a read-only view of today's schedule for therapists. Clinical and financial data are never cached.
- Clear caches and local storage on logout; auto-lock after inactivity.
- Install prompt: custom banner after the second visit. On iOS show "Add to Home Screen" instructions (push works only when installed, iOS 16.4+).
- Safe-area insets (`env(safe-area-inset-*)`) respected by header and bottom elements.

## 8. Accessibility
- All icon-only controls (collapsed sidebar, bell, close) have `aria-label` and tooltips on hover/focus.
- Colour is never the only signal: cancelled has strike-through plus label, overdue has text, grey permission states have icons (see Role access).
- Contrast: purple-600 on white and white on purple-600 pass AA. Teal-500 button uses dark text, not white.
