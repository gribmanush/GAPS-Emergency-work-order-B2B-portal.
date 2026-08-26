/**
 * PLACEHOLDER — awaiting Aanay's implementation (Jira TJ-28 GAP Admin Dashboard, TJ-29 Vet Dashboard).
 * Replace this file with his real version at this exact path: app/features/dashboard/Dashboard.tsx.
 * See CONTRIBUTING.md / CONTRIBUTION_INDEX.md at the repo root.
 */
"use client";

import { PageHead } from "../../shared/PageHead";
import { Invoice, Role, WorkOrder } from "../../shared/types";

export function Dashboard({ role }: { role: Role; orders: WorkOrder[]; invoices: Invoice[]; setRoute: (r: string) => void; setModal: (m: string) => void }) {
  return <>
    <PageHead eyebrow="OPERATIONS OVERVIEW" title={`Good morning, ${role.split(" ")[0]}`} subtitle="Dashboard placeholder — Aanay's real dashboard (TJ-28, TJ-29) replaces this screen." />
    <div className="panel"><p>Stand-in dashboard. Use the sidebar to reach Work Orders or Invoices.</p></div>
  </>;
}
