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
- CSV exports, responsive layouts and accessible form controls
- Browser-local persistence and demonstration-data reset

## Running locally

Install dependencies and start the development server using the package scripts. Open the local URL shown by the server. The validated production build uses the `build` script.

## Prototype limitations

- Data is synthetic and stored only in the browser for demonstration.
- Authentication and Microsoft Entra ID are simulated.
- File upload stores no real clinical document.
- Email and external notifications are simulated.
- Coupa and Dynamics 365 are not connected in this build.
- Production use requires secure backend authentication, server-enforced authorisation, a managed database, encrypted document storage, monitoring and approved enterprise integrations.

## Team JAM

- Aanay
- Jubayer
- Ankita
- Arjun
- MUHAIMINUL CHOUDHURY

Prototype demonstration only. Not for operational, financial or clinical use.
