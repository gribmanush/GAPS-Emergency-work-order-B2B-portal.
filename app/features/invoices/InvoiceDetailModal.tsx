/**
 * Team JAM contribution: JUBAYER ALAM
 * Invoice detail view opened from the invoices table or an invoice notification.
 */
"use client";

import { badge, Invoice, money } from "../../shared/types";

export function InvoiceDetailModal({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="modal" role="dialog" aria-modal="true" aria-label={`Invoice ${invoice.id}`}>
      <div className="modal-head">
        <div><p className="eyebrow">INVOICE</p><h2>{invoice.id}</h2></div>
        <button onClick={onClose} aria-label="Close">×</button>
      </div>
      <div className="modal-body">
        <dl>
          <div><dt>Work order</dt><dd>{invoice.workOrder}</dd></div>
          <div><dt>Practice</dt><dd>{invoice.practice}</dd></div>
          <div><dt>Amount</dt><dd>{money(invoice.amount)}</dd></div>
          <div><dt>Status</dt><dd><span className={badge(invoice.status)}>{invoice.status}</span></dd></div>
          <div><dt>Date</dt><dd>{invoice.date}</dd></div>
          <div><dt>Version</dt><dd>v{invoice.version}</dd></div>
        </dl>
      </div>
      <div className="modal-actions">
        <button type="button" className="secondary" onClick={onClose}>Close</button>
      </div>
    </div>
  </div>;
}
