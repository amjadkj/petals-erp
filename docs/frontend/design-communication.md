# Page: Communication

Route: `/communication` · Header title: "Communication"
Source: **derived from PRD 4.1.6 and the Phase 13 API (no mockup supplied)**.
API: `GET/POST/PATCH /communication/templates` · `POST /communication/templates/:id/approve|reject` · `POST /communication/send` · `POST /communication/send-bulk` · `POST /clients/:id/call-logs` · `GET /clients/:id/communication-logs`. The request DTOs are empty in the OpenAPI export; confirm shapes before building the forms.

## 1. Layout
**Hero:** encouraging headline (for example "Every message, with care.") · actions `New message` (primary), `New template` (outline).
**Stat cards:** Sent today · Delivered · Failed · Daily cap used (for example 120 / 500).

## 2. Tabs
1. **Messages / Log:** table: Client (guardian), Channel icon (WhatsApp, Email, Call), Template, Status chip (Queued, Sent, Delivered, Failed), Sent by, Time. Click opens details drawer. Filters: channel, status, date, client.
2. **Templates:** cards or table with name, channel, status (Draft, Pending approval, Approved, Rejected) and `Approve` / `Reject` (Director and Manager only). Only approved WhatsApp templates can be sent.
3. **Bulk send:** filters (for example "all clients with pending fees", branch, department), recipient count preview, template picker, consent warning ("3 guardians excluded: no WhatsApp consent"), rate-limit hint (5 bulk sends per hour). Confirm modal shows message cost estimate.

## 3. New message (modal)
Recipient (client/guardian search), Channel (WhatsApp / Email), Template (approved only), variable fields filled from context (name, date, amount), preview bubble, `Send`. Calls: `Log call` button in the same modal opens a small form (outcome, notes).

## 4. Rules to reflect in UI
- No clinical details in messages (server returns 400): show a helpful inline error.
- Consent flags per guardian: show disabled channel with tooltip "No consent".
- Starting a message from a client profile or a payment reminder pre-selects the template.

## 5. Mobile
Tabs become a segmented scroller. Log rows become cards. New message and template forms are bottom sheets. Bulk send is a stepped flow (Audience → Template → Review).
