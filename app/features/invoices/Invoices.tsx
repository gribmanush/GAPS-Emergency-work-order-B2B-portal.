/**
 * Team JAM contribution: JUBAYER ALAM
 * Invoice review screen and tax-invoice submission entry point.
 */
"use client";

import { PageHead } from "../../shared/PageHead";
import { badge, Invoice, money, Role } from "../../shared/types";

export function Invoices({ invoices, role, update, setModal }: { invoices: Invoice[]; role: Role; update: (id: string, s: string) => void; setModal: (m: string) => void }) {
  return <>
    <PageHead eyebrow="FINANCE" title="Invoices" subtitle="Review veterinary charges against authorised work" action={role === "Veterinary Practice" ? "Submit invoice" : undefined} onAction={() => setModal("invoice")} />
    <div className="notice-banner"><b>Coupa integration paused</b><span>Approved invoices remain at “Approved — Coupa pending”. No external financial data is transmitted.</span></div>
    <div className="table-card">
      <table>
        <thead><tr><th>Invoice</th><th>Work order</th><th>Practice</th><th>Date</th><th>Version</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{invoices.map(i => <tr key={i.id}>
          <td><b>{i.id}</b></td><td>{i.workOrder}</td><td>{i.practice}</td><td>{i.date}</td><td>v{i.version}</td><td><b>{money(i.amount)}</b></td>
          <td><span className={badge(i.status)}>{i.status}</span></td>
          <td>{role === "Finance Approver" && i.status === "Submitted" ? <div className="mini-actions"><button onClick={() => update(i.id, "Approved — Coupa pending")}>Approve</button><button onClick={() => update(i.id, "Rejected")}>Reject</button></div> : <button className="table-link">View</button>}</td>
        </tr>)}</tbody>
      </table>
    </div>
  </>;
}
