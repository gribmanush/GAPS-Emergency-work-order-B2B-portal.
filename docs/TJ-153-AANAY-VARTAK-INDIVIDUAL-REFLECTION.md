# TJ-153 — Individual reflection: Aanay Vartak

Date: 5 October 2026  
Team: JAM  
Project: GAP Emergency Veterinary Portal

## My role and contribution

My role combined development work with Scrum leadership. I helped translate the client workflow into a portal that can be demonstrated end to end, and I took responsibility for the GAP and veterinary dashboard experience, Firestore-backed invoice approval work, Coupa-ready output evidence, in-app notifications, veterinary registration/eligibility and emergency-case creation.

During Sprint 3 I acted as Scrum Master. I organised the sprint goal and meeting expectations, tracked Jira work and prepared the sprint evidence. In the current work I returned to the latest shared `main` branch before making changes. This was important because an earlier implementation was difficult for the team to merge. I learned that technically correct code is not enough if the branch history and integration approach create unnecessary work for other team members.

## What went well

- I developed a clearer understanding of the complete business journey rather than only my assigned screens.
- I used the team's existing Firebase configuration instead of creating a personal Firebase project.
- I separated live Coupa integration from the realistic semester requirement of producing a structured downstream output.
- I used Jira keys, a dedicated feature branch, documentation and automated checks to create clearer evidence of completion.
- I reviewed the latest shared implementation before claiming tickets were finished.

## Challenges and how I responded

The biggest technical challenge was integrating changes while the shared repository continued to evolve. My earlier work overlapped with the application shell and was difficult to merge. I responded by starting again from the latest `main`, keeping changes focused and verifying the combined system rather than defending an outdated branch.

Another challenge was ambiguity in short user stories. “Register vets” could mean registering a veterinary organisation, creating a clinician login, or approving a provider for assignment. I resolved this by documenting a clear workflow: GAP registers and governs the practice; a clinician creates an authenticated veterinary profile linked to that practice; only licensed clinicians from Approved and Active practices appear for assignment.

The emergency-case story also looked complete at first because the form saved an incident. On review, it recorded only a hard-coded count and did not identify the affected greyhounds. I corrected this by requiring one or more registered greyhound selections and storing their IDs, names and count with reporter and location details.

## Technical learning

I improved my understanding of:

- React and TypeScript component/data boundaries;
- Firebase Authentication and role-specific profile collections;
- Firestore listeners, security rules, batched writes and transactional lifecycle updates;
- UID-based veterinary assignment rather than weak practice-name-only matching;
- testable pure workflow functions and acceptance-focused testing;
- Git branching from current `main`, small commits and reviewable pull requests.

I also learned that interface restrictions alone are not security. Role rules and record ownership need to be enforced at the database layer, and sensitive workflow claims need supporting evidence.

## Teamwork and leadership reflection

As Scrum Master, I tried to make work visible and keep the team focused on the sprint goal. A strength was communicating tasks and meeting expectations clearly. An area for improvement is raising integration risks earlier and checking that every team member understands the end-to-end system before the final demonstration.

I also need to manage documentation deadlines more carefully. TJ-148 and TJ-153 became overdue because development work received priority. I completed them by connecting the documentation directly to the implementation and acceptance evidence, but in future I will create documentation progressively during the sprint rather than treating it as an end task.

## Evidence of my work

| Area | Evidence |
|---|---|
| TJ-75 notifications | Firestore notification subscription, personal/staff visibility, read controls and work-order navigation |
| TJ-76 veterinary registration | Full practice registration data and eligibility filtering for licensed vets from Approved/Active practices |
| TJ-77 emergency cases | Multi-greyhound selection, identity persistence, reporter details, audit and staff notification |
| TJ-148 project foundation | `docs/TJ-148-PROJECT-FOUNDATION.md` |
| Quality | Automated Sprint 5 workflow tests, ESLint and production build |

## Actions for the next sprint

1. Break user stories into acceptance criteria before implementation begins.
2. Keep branches current with `main` and ask for review early.
3. Add Jira evidence immediately after each tested change.
4. Run a whole-team walkthrough so every member can explain the complete system.
5. Treat TJ-157 email delivery as a separate feature; do not describe in-app notifications as email.

## Overall reflection

This project has helped me move from building isolated interface features toward thinking like a product developer and Scrum leader. My most important lesson is that professional delivery requires traceability, shared understanding and honest technical boundaries as much as working code. The strongest result is not simply a feature that runs on my machine; it is a feature that the team can review, merge, explain and demonstrate confidently.
