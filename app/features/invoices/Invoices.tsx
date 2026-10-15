/**
 * Team JAM contribution: JUBAYER ALAM
 * Invoice review screen and tax-invoice submission entry point.
 */
"use client";

import { PageHead } from "../../shared/PageHead";
import { badge, Invoice, money, Role } from "../../shared/types";

export function Invoices({ invoices, search, role, update, setModal, onView }: { invoices: Invoice[]; search: string; role: Role; update: (id: string, s: string) => void; setModal: (m: string) => void; onView: (invoice: Invoice) => void }) {
  const list = invoices.filter(i => JSON.stringify(i).toLowerCase().includes(search.toLowerCase()));
  return <>
    <PageHead eyebrow="FINANCE" title="Invoices" subtitle="Review veterinary charges against authorised work" action={role === "Veterinary Practice" ? "Submit invoice" : undefined} onAction={() => setModal("invoice")} />
    <div className="notice-banner"><b>Coupa integration paused</b><span>Approved invoices remain at “Approved — Coupa pending”. No external financial data is transmitted.</span></div>
    <div className="table-card">
      <table>
        <thead><tr><th>Invoice</th><th>Work order</th><th>Practice</th><th>Date</th><th>Version</th><th>Total</th><th>File</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{list.map(i => <tr key={i.id}>
          <td><b>{i.id}</b></td><td>{i.workOrder}</td><td>{i.practice}</td><td>{i.date}</td><td>v{i.version}</td><td><b>{money(i.amount)}</b>{i.overLimit ? <span className={badge("over-limit")} title="Exceeds the work order's spending limit — requires GAP approval"> Over Limit</span> : null}</td>
          <td>{i.fileData ? <a href={i.fileData} download={i.fileName}>{i.fileName}</a> : "—"}</td>
          <td><span className={badge(i.status)}>{i.status}</span></td>
          <td>{(role === "Finance Approver" || role === "GAP Administrator") && i.status === "Submitted" ? <div className="mini-actions"><button onClick={() => update(i.id, "Approved — Coupa pending")}>Approve</button><button onClick={() => update(i.id, "Rejected")}>Reject</button></div> : <button className="table-link" onClick={() => onView(i)}>View</button>}</td>
        </tr>)}</tbody>
      </table>
      {!list.length ? <div className="empty"><b>{invoices.length ? "No matching invoices" : "No invoices yet"}</b><span>{invoices.length ? "Try changing the search term." : "Submitted invoices will appear here for review."}</span></div> : null}
    </div>
  </>;
}
