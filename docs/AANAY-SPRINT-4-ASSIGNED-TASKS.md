# Aanay Vartak — Sprint 4 assigned tasks

This branch implements the six items visible under Aanay's Jira filter on 22 September 2026.

## TJ-51 — Veterinary task management

- Practice-scoped task list.
- Priority ordering and status filters.
- New, acknowledged, in-treatment and completed counters.
- Existing acknowledgement, decline, start-treatment and completion actions remain available from task detail.

## TJ-75 — Role-aware notifications

- Assignment, work-order, invoice, emergency and account notification categories.
- Role audiences prevent unrelated roles seeing a notification.
- Unread filtering, mark-one and mark-all-as-read.
- A notification opens its relevant portal route and, for work orders, its record.

This is an in-app notification implementation. External email or SMS delivery is not claimed.

## TJ-76 — GAP veterinary registration

- GAP Administrator-only registration action.
- Captures business identity, contact details, veterinary registration, coverage, approval, operational status and supplier reference.
- Only Approved and Active practices appear in work-order assignment.

## TJ-77 — GAP emergency-case creation

- GAP Administrator and Case Manager-only creation action.
- Captures type, priority, occurrence time, location, affected-greyhound count, summary and reporter details.
- Creates a traceable Draft incident that can be selected when creating a work order.

## TJ-91 and TJ-94

The parent commit on this branch implements staff/veterinary dashboards and four dashboard tests. See `docs/TJ-28-TJ-29-DASHBOARDS.md`.

## Verification

- Four dashboard tests.
- Five Sprint 4 workflow tests.
- ESLint and production build.
