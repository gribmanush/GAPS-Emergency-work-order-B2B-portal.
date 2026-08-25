/**
 * Team JAM contribution: JUBAYER ALAM
 * "Submit veterinary invoice" modal fields (tax invoice capture).
 */
"use client";

import { seedOrders } from "../../shared/seed-data";

export function InvoiceForm() {
  return <div className="form-grid">
    <label>Work order<select name="workOrder" required>{seedOrders.filter(o => ["Completed by Vet", "Closed"].includes(o.status)).map(o => <option key={o.id}>{o.id}</option>)}</select></label>
    <label>Invoice total (AUD)<input name="amount" type="number" min="0" step="0.01" required /></label>
    <label className="full">Supporting invoice<input type="file" accept=".pdf,.png,.jpg,.jpeg" /></label>
    <div className="full form-note">Submission creates an auditable invoice for GAP finance review. No data is sent to Coupa.</div>
  </div>;
}
