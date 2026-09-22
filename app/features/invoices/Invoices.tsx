/**
 * Team JAM contribution: AANAY VARTAK
 * Jira: TJ-109 Firestore invoice workflow; TJ-110 finance-system exports.
 */
"use client";

import { useMemo, useState } from "react";
import { PageHead } from "../../shared/PageHead";
import type { FinanceExportFormat, Invoice, InvoiceStatus, Role } from "../../shared/types";
import { badge, money } from "../../shared/types";

type ReviewStatus = Extract<InvoiceStatus, "Under Review" | "Approved — Ready for export" | "Rejected">;

export function Invoices({
  invoices, role, persistence, busyId, onReview, onExport, setModal,
}: {
  invoices: Invoice[];
  role: Role;
  persistence: "firestore" | "connecting" | "error";
  busyId: string | null;
  onReview: (invoice: Invoice, status: ReviewStatus, comment: string) => Promise<void>;
  onExport: (invoice: Invoice, format: FinanceExportFormat) => Promise<void>;
  setModal: (m: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [filter, setFilter] = useState("All");
  const selected = invoices.find(invoice => invoice.id === selectedId) || null;
  const rows = useMemo(() => invoices.filter(invoice => filter === "All" || invoice.status === filter), [invoices, filter]);
  const canReview = role === "Finance Approver" || role === "GAP Administrator";

  async function review(status: ReviewStatus) {
    if (!selected) return;
    await onReview(selected, status, comment);
    setComment("");
  }

  return <>
    <PageHead eyebrow="FINANCE" title="Invoices" subtitle="Submit, review, approve and export veterinary invoices" action={role === "Veterinary Practice" ? "Submit invoice" : undefined} onAction={() => setModal("invoice")} />
    <div className={`notice-banner ${persistence === "error" ? "notice-error" : ""}`}>
      <b>{persistence === "firestore" ? "Firestore connected" : persistence === "connecting" ? "Connecting to Firestore" : "Firestore unavailable"}</b>
      <span>{persistence === "firestore" ? "Invoice records, approvals and export history use the same Firebase project as authentication." : "Check the signed-in role, Firestore database and deployed security rules. No personal Firebase account is used."}</span>
    </div>
    <div className="toolbar">
      <div className="filter-tabs">{["All", "Submitted", "Under Review", "Approved — Ready for export", "Rejected", "Exported"].map(item => <button className={filter === item ? "active" : ""} key={item} onClick={() => setFilter(item)}>{item}</button>)}</div>
      <div className="workflow-key"><span>Vet submits</span><i>→</i><span>GAP approves</span><i>→</i><span>Finance export</span></div>
    </div>
    <div className="table-card">
      <table>
        <thead><tr><th>Invoice</th><th>Work order</th><th>Practice</th><th>Invoice date</th><th>Version</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>{rows.map(invoice => <tr key={invoice.id}>
          <td><b>{invoice.id}</b><small>{invoice.invoiceNumber}</small></td>
          <td>{invoice.workOrder}</td>
          <td>{invoice.practice}<small>{invoice.supplierId}</small></td>
          <td>{invoice.invoiceDate || invoice.date}</td>
          <td>v{invoice.version}</td>
          <td><b>{money(invoice.amount)}</b><small>GST {money(invoice.gst)}</small></td>
          <td><span className={badge(invoice.status)}>{invoice.status}</span></td>
          <td><button className="table-link" onClick={() => { setSelectedId(invoice.id); setComment(invoice.reviewComment || ""); }}>Review details</button></td>
        </tr>)}</tbody>
      </table>
      {!rows.length ? <div className="empty"><b>No invoices in this view</b><span>Submit an eligible invoice or choose another status filter.</span></div> : null}
    </div>

    {selected ? <section className="panel invoice-review" aria-label={`Invoice ${selected.id} details`}>
      <div className="panel-head">
        <div><p className="eyebrow">INVOICE DETAIL</p><h2>{selected.invoiceNumber}</h2><p>{selected.id} · {selected.workOrder} · version {selected.version}</p></div>
        <button onClick={() => setSelectedId(null)}>Close</button>
      </div>
      <div className="invoice-summary">
        <div><small>Supplier</small><b>{selected.practice}</b><span>{selected.supplierId}</span></div>
        <div><small>Invoice date</small><b>{selected.invoiceDate}</b><span>Due {selected.dueDate}</span></div>
        <div><small>Net / GST</small><b>{money(selected.subtotal)}</b><span>{money(selected.gst)}</span></div>
        <div><small>Total</small><b>{money(selected.amount)}</b><span>{selected.currency}</span></div>
      </div>
      <table className="line-items">
        <thead><tr><th>Description</th><th>Qty</th><th>Unit price</th><th>GST</th><th>Total</th></tr></thead>
        <tbody>{selected.lineItems.map((item, index) => <tr key={`${selected.id}-${index}`}><td>{item.description}</td><td>{item.quantity}</td><td>{money(item.unitPrice)}</td><td>{item.gstRate}%</td><td>{money(item.grossAmount)}</td></tr>)}</tbody>
      </table>
      <div className="review-meta">
        <span>Submitted by <b>{selected.submittedBy}</b> on {formatTimestamp(selected.submittedAt)}</span>
        {selected.reviewedBy ? <span>Reviewed by <b>{selected.reviewedBy}</b> on {formatTimestamp(selected.reviewedAt)}</span> : null}
        {selected.exportReference ? <span>Export reference <b>{selected.exportReference}</b></span> : null}
      </div>
      {canReview && ["Submitted", "Under Review"].includes(selected.status) ? <div className="review-box">
        <label>Finance review comment<textarea value={comment} onChange={event => setComment(event.target.value)} placeholder="Record an approval note or a clear rejection reason" /></label>
        <div className="action-row">
          {selected.status === "Submitted" ? <button className="secondary" disabled={busyId === selected.id} onClick={() => review("Under Review")}>Start review</button> : null}
          <button className="primary" disabled={busyId === selected.id} onClick={() => review("Approved — Ready for export")}>Approve invoice</button>
          <button className="danger-button" disabled={busyId === selected.id || comment.trim().length < 5} onClick={() => review("Rejected")}>Reject invoice</button>
        </div>
      </div> : null}
      {canReview && ["Approved — Ready for export", "Exported"].includes(selected.status) ? <div className="export-box">
        <div><b>Finance-system output</b><p>Generate a traceable canonical payload suitable for mapping into Coupa. This demonstration does not call a Coupa API.</p></div>
        <div className="action-row"><button className="secondary" disabled={busyId === selected.id} onClick={() => onExport(selected, "json")}>Download JSON</button><button className="secondary" disabled={busyId === selected.id} onClick={() => onExport(selected, "csv")}>Download CSV</button></div>
      </div> : null}
    </section> : null}
  </>;
}

function formatTimestamp(value?: string) {
  if (!value) return "Not recorded";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString("en-AU");
}
