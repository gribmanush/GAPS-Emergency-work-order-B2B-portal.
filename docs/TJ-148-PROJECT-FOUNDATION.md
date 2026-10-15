# TJ-148 — Project foundation: GAP Emergency Veterinary Portal

Prepared by **Aanay Vartak** for Team JAM  
Version: 1.0 — 5 October 2026

## 1. Executive summary

Team JAM is developing an internal business-to-business portal for Greyhounds As Pets NSW (GAP NSW), coordinated by Greyhound Racing NSW (GRNSW). The portal supports the emergency veterinary process from incident recording through work-order assignment, veterinary treatment, invoice submission, GAP approval and a finance-ready output.

The product replaces fragmented coordination with one role-controlled workflow and a traceable record of decisions. The current solution uses Firebase Authentication and Cloud Firestore, provides separate GAP staff and veterinary experiences, and records operational events and audit evidence. The semester deliverable demonstrates a finance-system output suitable for a platform such as Coupa; it does not claim a live Coupa connection.

## 2. Client context and problem

### Confirmed context

- GAP NSW supports greyhound welfare, transition and rehoming activities and operates within the broader GRNSW environment.
- Emergency treatment may involve one or multiple greyhounds, external veterinary providers, time-sensitive work orders and later invoices.
- The client requires both GAP staff and veterinary users to participate in the workflow.
- The client will not provide a Coupa API for the capstone. A demonstrable structured output is therefore the agreed technical boundary.

### Problem statement

Emergency veterinary work becomes difficult to govern when incident facts, greyhound identity, provider assignment, treatment status, invoices and approvals are held across separate messages or files. GAP staff need to know who is responsible and what requires action; veterinary users need a clear queue and authorisation; finance reviewers need invoice traceability. Without a shared workflow, information may be duplicated, delayed or disconnected from the original emergency case.

## 3. Project charter

| Item | Definition |
|---|---|
| Project | GAP Emergency Veterinary Work Order and Invoice Portal |
| Client context | GAP NSW / GRNSW |
| Delivery team | Team JAM: Aanay Vartak, Jubayer Alam, Ankita Basnet, Arjun Singh and MUHAIMINUL CHOUDHURY |
| Product goal | Provide a secure, understandable and traceable emergency-veterinary workflow for GAP staff and veterinary providers |
| Primary users | GAP Administrator, GAP Case Manager, Veterinary Practice, Finance Approver and GRNSW Auditor |
| Delivery approach | Iterative Scrum delivery using Jira, Confluence and GitHub |
| Technical platform | React/TypeScript interface, Firebase Authentication and Cloud Firestore |
| Success evidence | End-to-end demonstration, role controls, persistent records, audit trail, automated checks and finance-ready export evidence |

### Guiding principles

1. Greyhound welfare and urgent action take priority.
2. Users see only the records needed for their role.
3. Important changes create traceable notifications and audit evidence.
4. Automation supports staff decisions; it does not replace welfare or financial approval.
5. Claims made in demonstrations must match implemented functionality.

## 4. Objectives and scope

### Objectives

- Record an emergency case and identify every affected greyhound.
- Allow GAP staff to use approved veterinary organisations and registered clinicians.
- Create, assign, accept, reject, reassign and progress emergency work orders.
- Give veterinary users an organised view of their own work.
- Persist operational data in shared Firestore collections.
- Submit and review invoices against the relevant work order.
- Produce traceable, structured finance data suitable for downstream Coupa-style processing.
- Provide in-app notifications and an audit trail for important actions.

### In scope

- Firebase sign-in and role profiles.
- Greyhound, practice, incident, work-order, invoice, notification and audit records.
- GAP staff and veterinary workflows.
- Practice and clinician eligibility checks before assignment.
- Multi-greyhound emergency cases and work orders.
- In-app notification read state and work-order navigation.
- Responsive browser interface and automated workflow tests.

### Out of scope for this semester

- Live Coupa or Dynamics 365 API integration.
- Production email/SMS delivery (tracked separately in TJ-157).
- Clinical diagnosis or automated treatment decisions.
- Payment execution, banking or procurement approval outside the portal.
- Production deployment certification, disaster recovery and formal penetration testing.

## 5. Requirements analysis

### Functional requirements

| ID | Requirement | Acceptance evidence |
|---|---|---|
| FR-01 | Users authenticate and receive role-appropriate access. | Role profile is loaded from Firestore and restricted navigation is hidden. |
| FR-02 | GAP staff create an emergency case linked to at least one registered greyhound. | Saved incident contains IDs, names, count, time, location, priority, summary and reporter. |
| FR-03 | GAP staff register a veterinary organisation. | Full identity/contact data is persisted with Pending/Inactive governance status. |
| FR-04 | Only licensed clinicians attached to Approved and Active practices can be assigned. | Assignment directory filters the registered clinician profiles. |
| FR-05 | GAP staff create a work order for a registered vet or the shared pool. | Firestore work order and audit entry are created; direct assignment creates a personal notification. |
| FR-06 | A vet accepts or rejects an assignment. | The assigned account alone can act; rejection returns the order for staff reassignment. |
| FR-07 | Work orders follow the defined lifecycle without skipped stages. | Repository validates every transition and writes audit/notification records. |
| FR-08 | Veterinary users submit an invoice for relevant completed work. | Invoice is stored against a work order and visible to finance roles. |
| FR-09 | GAP/finance users approve or reject invoices. | Status change is persistent and auditable. |
| FR-10 | Users receive relevant in-app notifications. | Personal vet notices and staff-only notices are role/UID scoped and support read state. |
| FR-11 | The solution demonstrates downstream finance compatibility. | Approved invoice information can be transformed into a documented structured output; no live Coupa claim is made. |

### Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-01 | Authorisation is enforced in Firestore rules as well as the interface. |
| NFR-02 | Veterinary users cannot read another clinician's assigned work. |
| NFR-03 | Operational changes are persistent across browsers and sessions. |
| NFR-04 | Important multi-record writes use batched or transactional operations where consistency matters. |
| NFR-05 | Forms provide required-field validation and understandable errors. |
| NFR-06 | The interface remains usable on desktop and mobile widths. |
| NFR-07 | Synthetic demonstration data is used; the prototype is not presented as a clinical production system. |

## 6. MVP journey

1. GAP staff records an emergency and selects the affected greyhound(s).
2. GAP staff creates a work order and assigns a registered vet or publishes it to the pool.
3. The vet receives an in-app notification and accepts or rejects the work.
4. The vet records treatment progress and completes the veterinary work.
5. The vet submits an invoice linked to the work order.
6. GAP/finance reviews and approves or rejects the invoice.
7. The approved invoice produces traceable data suitable for a downstream finance system.

## 7. Risks and controls

| Risk | Control |
|---|---|
| Unauthorised access to another vet's records | UID-scoped queries, application filters and Firestore rules |
| An ineligible provider is assigned | Approved/Active practice and licence checks |
| Emergency case lacks animal identity | At least one registered greyhound is mandatory |
| Status or audit history diverges | Transactional lifecycle updates |
| Team overstates integration maturity | Documentation explicitly distinguishes export capability from live Coupa integration |
| AI-generated code is not understood | Named ownership, peer review, tests and end-to-end team walkthroughs |

## 8. Definition of done

A requirement is complete only when the functionality is implemented from current `main`, validated by lint/tests/build, documented, committed with its Jira key, pushed for peer review and linked back to Jira. Client/UAT acceptance remains a separate step after merge and demonstration.
