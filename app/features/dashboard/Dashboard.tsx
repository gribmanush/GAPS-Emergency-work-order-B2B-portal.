/**
 * PLACEHOLDER — pending Anay's PR (TJ-28 GAP Admin Dashboard, TJ-29 Vet Dashboard).
 * Real implementation lives on his branch. This stub only exists so the app builds
 * and stays testable; it is not the real dashboard.
 */
"use client";

import { PageHead } from "../../shared/PageHead";
import { Invoice, Role, WorkOrder } from "../../shared/types";

export function Dashboard({ role }: { role: Role; orders: WorkOrder[]; invoices: Invoice[]; setRoute: (r: string) => void; setModal: (m: string) => void }) {
  return <>
    <PageHead eyebrow="OPERATIONS OVERVIEW" title={`Good morning, ${role.split(" ")[0]}`} subtitle="Dashboard placeholder — pending Anay's PR." />
    <div className="notice-banner"><b>Dashboard not yet merged</b><span>Anay&rsquo;s GAP Admin / Vet dashboard hasn&rsquo;t landed yet. Use the sidebar to navigate to other screens.</span></div>
  </>;
}
