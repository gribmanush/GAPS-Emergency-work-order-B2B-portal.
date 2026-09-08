# TJ-109 — Firestore invoice workflow

## Delivered workflow

1. A veterinary-practice user selects a completed, uninvoiced work order.
2. The form captures the supplier invoice number, invoice/due dates, treatment line, quantity, price, GST rate and supporting-file name.
3. Validation blocks a missing work order, unfinished veterinary work, practice mismatch, duplicate supplier invoice number, invalid dates, invalid lines and zero totals.
4. Firestore creates the invoice and an immutable audit event in one transaction.
5. GAP Administrator or Finance Approver can move Submitted to Under Review, then approve or reject it. A rejection requires a reason.
6. Every review writes the reviewer, timestamp, comment and a nested audit event in the same transaction.

## Firebase setup

1. Create a Firebase web app and a Cloud Firestore database.
2. Enable Anonymous sign-in in Firebase Authentication for the semester demonstration.
3. Copy firebase.env.example to .env.local and replace every placeholder.
4. Deploy firestore.rules.
5. Start the portal and sign in with a demo account. The Invoices page must display Firestore connected.

If Firebase variables are absent, the portal clearly enters demonstration mode and retains invoice data locally. This permits an offline showcase but is not presented as shared cloud persistence.

## Collections

- invoices/{invoiceId} — canonical invoice and current workflow status.
- invoices/{invoiceId}/auditEvents/{eventId} — append-only transition history.
- financeExports/{exportId} — immutable output-generation evidence.

## Production boundary

Anonymous Firebase Authentication is deliberately limited to the semester prototype. A production release must replace it with organisation-managed identity and server-issued role/supplier claims, restrict each vet to its own practice, upload supporting documents to protected object storage, and run finance export from a trusted server.
