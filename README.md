# GAP Emergency Veterinary Portal

Team JAM's interactive capstone prototype for Greyhounds As Pets NSW (GAP NSW), coordinated by Greyhound Racing NSW (GRNSW).

## Purpose

The portal coordinates an emergency veterinary workflow from incident intake through multi-greyhound work orders, veterinary assignment, treatment progress, invoice submission and GAP finance review.

Coupa is deliberately disabled in this build. Approved invoices stop at **Approved — Coupa pending** and no financial data leaves the application.

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
- Veterinary invoice submission and finance approval/rejection
- Notifications, operational reports and audit records
- Registered veterinary-organisation governance and licensed-clinician assignment
- Multi-greyhound emergency cases with reporter and location traceability
- CSV exports, responsive layouts and accessible form controls
- Shared Cloud Firestore persistence with role-aware subscriptions

## Running locally

Install dependencies and start the development server using the package scripts. Open the local URL shown by the server. The validated production build uses the `build` script.

## Prototype limitations

- Data is synthetic and the application is not approved for operational or clinical use.
- Firebase Authentication is implemented; Microsoft Entra ID is not connected.
- Clinical-document storage remains a prototype implementation.
- In-app notifications are implemented. Transactional email delivery is implemented through an authenticated Cloudflare Worker and Resend; deployment requires the five secrets documented in `docs/EMAIL-NOTIFICATIONS.md`. SMS delivery is not included.
- Coupa and Dynamics 365 are not connected in this build.
- Production use requires secure backend authentication, server-enforced authorisation, a managed database, encrypted document storage, monitoring and approved enterprise integrations.

## Team JAM

- Aanay
- Jubayer
- Ankita
- Arjun
- MUHAIMINUL CHOUDHURY

Prototype demonstration only. Not for operational, financial or clinical use.
