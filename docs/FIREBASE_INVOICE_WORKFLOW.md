# TJ-109 — Firestore invoice workflow

## Delivered workflow

1. A veterinary-practice user selects a completed, uninvoiced work order.
2. The form captures the supplier invoice number, invoice/due dates, treatment line, quantity, price, GST rate and supporting-file name.
3. Validation blocks a missing work order, unfinished veterinary work, practice mismatch, duplicate supplier invoice number, invalid dates, invalid lines and zero totals.
4. Firestore creates the invoice and an immutable audit event in one transaction.
5. GAP Administrator or Finance Approver can move Submitted to Under Review, then approve or reject it. A rejection requires a reason.
6. Every review writes the reviewer, timestamp, comment and a nested audit event in the same transaction.

## Firebase setup

1. Create a Firebase web app and a Cloud Firestore database (see app/lib/firebase.ts for the project this build points at).
2. Enable Email/Password sign-in in Firebase Authentication, and Firestore, in that project.
3. Deploy firestore.rules (`firebase deploy --only firestore:rules`).
4. Start the portal, sign up or sign in with a real account. The Invoices page must display Firestore connected.

If Firestore cannot be reached (rules not deployed, network issue, etc.), the portal enters demonstration mode and retains invoice data locally. This permits an offline showcase but is not presented as shared cloud persistence.

## Collections

- users/{uid} — the signed-in account's role and profile fields, written at sign-up.
- invoices/{invoiceId} — canonical invoice and current workflow status.
- invoices/{invoiceId}/auditEvents/{eventId} — append-only transition history.
- financeExports/{exportId} — immutable output-generation evidence.

## Production boundary

Every actor is a real, named Firebase Authentication account (email/password) tied to a Firestore profile — there is no anonymous or demo login path. A production release must still add organisation-managed identity (e.g. Microsoft Entra ID for GAP staff) and server-issued role/supplier claims, restrict each vet to its own practice, upload supporting documents to protected object storage, and run finance export from a trusted server.
