BUSINESS DECISIONS
- Manager sees administrative client data only (no assessments, observations, goals, progress, clinical reports).
- A therapist can see other therapists' notes on a shared client; edits stay with the author and the Director.
- Leave is approved by the Director; a Manager acts as backup approver when the Director is unavailable (LeaveRequest.backupApproval = true).
- WhatsApp via the official Business API; Director and Manager own template approval and costs.
- Parents see payment STATUS only (paid / pending / advance), no online payment.
- Director can edit and delete therapists' clinical entries; every edit/delete keeps the original in ClinicalEntryVersion; deletes are soft deletes.
- Revenue categories: CLINICAL_THERAPY (speech, OT, PT, ABA/behavioral, child psychotherapy) and ASSESSMENT_FEE. Manager and Director enter financial data.
