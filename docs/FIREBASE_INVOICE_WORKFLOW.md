# Firestore invoice workflow

TJ-109 uses the Firebase project already configured in `app/lib/firebase.ts`. It does not create or reference a personal Firebase project.

## Collections

- `users/{uid}` stores the authenticated user profile and role.
- `invoices/{invoiceId}` stores the submitted invoice and its current state.
- `invoices/{invoiceId}/auditEvents/{eventId}` stores immutable workflow events.
- `financeExports/{exportId}` records each generated JSON or CSV output.

## Workflow

1. A signed-in veterinary user submits an invoice for a completed work order.
2. Firestore stores the invoice with status `Submitted` and the authenticated user ID.
3. A GAP Administrator or Finance Approver starts review, approves or rejects it.
4. An approved invoice moves to `Approved — Ready for export`.
5. JSON or CSV generation records an export document and changes the invoice status to `Exported`.

The application uses Firestore transactions for submission, review and export recording so the invoice and audit event change together.

## Firebase setup

The shared project owner must create the Firestore database and deploy `firestore.rules`. Authentication and Firestore must remain in the same project. The committed web configuration identifies the project but does not replace security rules or authorised user profiles.

## Demonstration boundary

The attachment control records a filename only. Do not upload real clinical or financial documents until approved Firebase Storage rules and retention requirements are implemented.
