# GAP Emergency Veterinary Portal

Team JAM's interactive capstone prototype for Greyhounds As Pets NSW (GAP NSW), coordinated by Greyhound Racing NSW (GRNSW).

## Purpose

The portal coordinates an emergency veterinary workflow from incident intake through multi-greyhound work orders, veterinary assignment, treatment progress, invoice submission and GAP finance review.

The client is not providing a Coupa API. Approved invoices can therefore generate a traceable, Coupa-ready JSON or CSV output without claiming a live integration.

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
- Audited Coupa-ready JSON/CSV output for approved invoices
- Notifications, operational reports and audit records
- CSV exports, responsive layouts and accessible form controls
- Browser-local persistence and demonstration-data reset

## Running locally

Install dependencies with pnpm, then run pnpm dev. Open the local URL shown by the server. The validated production build uses pnpm build.

## Invoice persistence

Copy firebase.env.example to .env.local, provide a Firebase web-app configuration, enable Anonymous Authentication for the semester demonstration and deploy firestore.rules. See docs/FIREBASE_INVOICE_WORKFLOW.md.

When Firebase is configured, invoices, review decisions and export evidence use Firestore transactions. Without configuration, the portal explicitly displays **Demonstration mode** and uses local storage.

## Prototype limitations

- Data is synthetic. Non-invoice modules remain browser-local; invoices use Firestore when configured.
- Authentication and Microsoft Entra ID are simulated.
- File upload stores no real clinical document.
- Email and external notifications are simulated.
- A Coupa API is not connected because the client is not providing one; approved invoices generate a canonical finance-system output instead.
- Production use requires secure backend authentication, server-enforced authorisation, a managed database, encrypted document storage, monitoring and approved enterprise integrations.

## Team JAM

- Aanay
- Jubayer
- Ankita
- Arjun
- MUHAIMINUL CHOUDHURY

Prototype demonstration only. Not for operational, financial or clinical use.
