# GAP Emergency Veterinary Portal

Team JAM's interactive capstone prototype for Greyhounds As Pets NSW (GAP NSW), coordinated by Greyhound Racing NSW (GRNSW).

## Purpose

The portal coordinates an emergency veterinary workflow from incident intake through multi-greyhound work orders, veterinary assignment, treatment progress, invoice submission and GAP finance review.

The portal does not call a Coupa API because the client will not provide one. After GAP approval, authorised finance users can generate traceable JSON or CSV files whose fields are ready to map into a finance system such as Coupa.

## Demonstrated roles

- GAP Administrator
- GAP Case Manager
- Veterinary Practice
- Finance Approver
- GRNSW Auditor

All demonstration accounts use password `Demo123!`:

- `admin@gap-demo.nsw`
- `manager@gap-demo.nsw`
- `vet@gap-demo.nsw`
- `finance@gap-demo.nsw`
- `auditor@grnsw-demo.nsw`

The role switcher in the header is a prototype review tool, not production authentication.

## Current capabilities

- Role-based sign-in and protected portal shell
- Role-specific dashboards and navigation
- Emergency-incident creation
- Greyhound and veterinary-practice directories
- Multi-greyhound work-order creation and status workflow
- Assignment acknowledgement, decline and reassignment states
- Treatment services and work-order history views
- Firestore-backed veterinary invoice submission and GAP finance approval/rejection
- Audited invoice status transitions and role-enforced finance actions
- Coupa-ready JSON and CSV output after approval (no live Coupa API)
- Notifications, operational reports and audit records
- CSV exports, responsive layouts and accessible form controls
- Shared Firebase Authentication and Firestore invoice persistence
- Browser-local persistence for remaining prototype modules and demonstration-data reset

## Running locally

Install dependencies and start the development server using the package scripts. Open the local URL shown by the server. The validated production build uses the `build` script.

## Firebase and invoice setup

This branch deliberately reuses `app/lib/firebase.ts`, the Firebase project already configured for user authentication. Do not replace it with a personal Firebase project.

1. Enable Firestore in that same Firebase project.
2. Deploy `firestore.rules` from this repository.
3. Ensure signed-in users have a `users/{uid}` profile with the correct role.
4. Sign in as a veterinary practice to submit an invoice for a completed work order.
5. Sign in as a GAP Administrator or Finance Approver to review, approve and export it.

See `docs/FIREBASE_INVOICE_WORKFLOW.md` and `docs/COUPA_READY_EXPORT.md` for the data flow and verification steps.

## Prototype limitations

- Data is synthetic. Invoice records and audit/export metadata use Firestore; other prototype records remain browser-local.
- Authentication uses Firebase email/password. Microsoft Entra ID is not connected.
- File upload stores no real clinical document.
- Email and external notifications are simulated.
- Coupa and Dynamics 365 are not connected; the build demonstrates a controlled outbound file handoff.
- Production use requires secure backend authentication, server-enforced authorisation, a managed database, encrypted document storage, monitoring and approved enterprise integrations.

## Team JAM

- Aanay
- Jubayer
- Ankita
- Arjun
- MUHAIMINUL CHOUDHURY

Prototype demonstration only. Not for operational, financial or clinical use.
