# Team JAM — TJ-25 contribution index

Source checked: Jira TJ-25, **Create a High Fidelity prototype using Figma**, on 21 August 2026. The word "Figma" is treated as the prototype phase; these files map the same functional ownership into the software codebase.

As of 24 August 2026 the UI was refactored out of a single shared file (`app/portal-app.tsx`) into per-feature component files, so each person's folder now contains the real screen(s) they own, not just a small helper file.

| Team member | Jira child items | Owned feature files | Helper/logic file | Jira status observed |
|---|---|---|---|---|
| Ankita Basnet | TJ-26 Sign in/Sign up; TJ-27 Forgot Password | `app/features/auth/Auth.tsx` | `app/contributions/ankita-auth.ts` | Done; Done |
| Aanay Vartak | TJ-28 GAP Admin Dashboard; TJ-29 Vet Dashboard | `app/features/dashboard/Dashboard.tsx` | `app/contributions/aanay-dashboards.ts` | To Do; To Do |
| Jubayer Alam | TJ-30 Emergency Work Order Form; TJ-34 Tax Invoice | `app/features/work-orders/*.tsx`, `app/features/invoices/*.tsx`, plus the app shell (`app/portal-app.tsx`, `app/layout.tsx`, `app/page.tsx`) and shared UI (`app/shared/*`) | `app/contributions/jubayer-workflows.ts` | Done; Done |
| Arjun Singh | TJ-35 Greyhounds | `app/features/greyhounds/*.tsx` | `app/contributions/arjun-greyhounds.ts` | Done |
| MUHAIMINUL CHOUDHURY | No TJ-25 child item assigned | None yet | `app/contributions/muhaimin-assignment-needed.ts` | Assignment required |

Screens with no named owner (Incidents, Veterinary Practices, Notifications, Reports, Audit Log, User Administration, Settings, Help — under `app/features/misc/`) are bundled with Jubayer's app-shell setup for now because no TJ-25 child item currently assigns them to a specific person. Reassign as needed once Jira has an owner for each.

**Correction (25 Aug 2026):** an earlier pass of this index had the Greyhounds ownership backwards. The team confirmed Arjun built TJ-35 (Greyhounds), and Muhaimin has not yet been assigned or has not yet implemented a TJ-25 child item.

## Evidence protocol

These files are organised contribution targets, not automatic proof that a named person authored the code. Each owner should:

1. Review and understand their assigned file(s).
2. Test the related portal workflow.
3. Make any necessary correction or improvement.
4. Commit from their own GitHub account with the Jira key in the commit message.
5. Open a pull request and request peer review.
6. Link the commit or pull request back to the relevant Jira item.

Recommended commit examples:

- `TJ-26 TJ-27 implement authentication and password recovery`
- `TJ-28 TJ-29 implement GAP and veterinary dashboards`
- `TJ-30 TJ-34 implement work-order and tax-invoice workflows`
- `TJ-35 implement greyhound directory and status records`

Do not assign Muhaimin credit under TJ-25 until Jira contains a real child item with a defined deliverable and acceptance criteria, and he has actually implemented it.
