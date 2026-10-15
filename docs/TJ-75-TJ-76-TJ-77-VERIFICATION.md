# TJ-75, TJ-76 and TJ-77 — implementation verification

Reviewed against GitHub `main` at commit `436e93a` on 5 October 2026. Corrections are implemented on `feature/aanay-sprint5-completion`.

## TJ-75 — in-app notifications

**Result: complete for the in-app story.**

- Notifications persist in the shared Firestore `notifications` collection.
- Direct vet assignments use `recipientUid`; another veterinary account cannot see them.
- GAP operational updates use `staffOnly` and are hidden from veterinary users.
- Users can mark one notification or all visible notifications as read.
- A work-order notification opens the relevant work-order review.
- Work-order creation, acceptance, rejection, reassignment, status changes, invoice events and new emergency cases generate relevant notices.

Boundary: this does not provide email. Email delivery is the separate TJ-157 story.

## TJ-76 — register vets for assignment

**Result: complete using the agreed two-stage registration model.**

1. GAP Administrator registers the veterinary organisation with legal/trading name, ABN, email, phone and emergency coverage.
2. The organisation begins as `Pending` and `Inactive` so it cannot immediately receive work.
3. A veterinary clinician creates an authenticated profile linked to an Approved and Active practice and supplies a licence number.
4. GAP work-order assignment lists only licensed clinicians whose linked practice is Approved and Active.

This avoids creating another person's Firebase password from the browser and separates organisation governance from clinician authentication.

## TJ-77 — create emergency cases

**Result: complete after correction.**

- GAP staff records type, priority, occurrence time, suburb/postcode, summary and reporter contact.
- At least one existing greyhound must be selected.
- Multiple greyhounds can be selected and their IDs, names and count persist on the incident.
- The incident is created as a traceable Draft record in Firestore.
- One batched write creates the incident, audit entry and GAP staff notification together.

## Verification

- Four automated acceptance tests pass.
- ESLint passes with no warnings.
- The production build passes.
- The build reports only the existing bundle-size advisory; it is not a compilation failure.
