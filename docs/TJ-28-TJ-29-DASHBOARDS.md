# TJ-28 and TJ-29 dashboard implementation

## TJ-28 — GAP Admin Dashboard

The GAP dashboard calculates its figures from the current work-order records. It shows open emergencies, work awaiting acknowledgement, active treatments and records requiring GAP action. The priority list and status distribution use the same current data rather than hard-coded totals.

GAP Administrators and GAP Case Managers can open the authorised work-order creation flow. Finance users are directed to invoice review, and auditors receive a read-only overview.

## TJ-29 — Veterinary Dashboard

The veterinary dashboard uses the authenticated profile's `practiceName`. It shows only work orders and invoices for that practice. If the profile has no practice name, the dashboard fails closed and displays no practice records.

The four metrics are new assignments, work in treatment, completed work ready to invoice and invoices under review. The main action directs the user to invoice submission; it does not offer work-order creation.

The work-order list and CSV export apply the same practice restriction so the dashboard does not lead to an unscoped list.

## Verification

- Four dashboard unit tests pass.
- ESLint passes.
- The production build completes.
- The branch starts from main commit `f769967`.

Live Firebase validation should confirm that each veterinary test profile has the correct `practiceName` before the Jira issues move from In Review to Done.
