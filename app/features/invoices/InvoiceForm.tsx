/**
 * Team JAM contribution: JUBAYER ALAM
 * "Submit veterinary invoice" modal fields (tax invoice capture).
 */
"use client";

import { useMemo } from "react";
import { Invoice, isWorkOrderStageAtLeast, WorkOrder } from "../../shared/types";

export function InvoiceForm({ orders, invoices, practice }: { orders: WorkOrder[]; invoices: Invoice[]; practice?: string }) {
  const eligibleOrders = useMemo(() => orders.filter(order => {
    const correctPractice = practice ? order.practice === practice : true;
    const completed = isWorkOrderStageAtLeast(order.status, "Veterinary Work Completed");
    const alreadyInvoiced = invoices.some(invoice => invoice.workOrder === order.id && invoice.status !== "Rejected");
    return correctPractice && completed && !alreadyInvoiced;
  }), [orders, invoices, practice]);

  return <div className="form-grid">
    <input type="hidden" name="practice" value={practice || "Unassigned"} />
    <label>Work order<select name="workOrder" required disabled={!eligibleOrders.length}><option value="">Select a work order</option>{eligibleOrders.map(order => <option key={order.id} value={order.id}>{order.id} — {order.dogs.join(", ")}</option>)}</select></label>
    <label>Invoice total (AUD)<input name="amount" type="number" min="0" step="0.01" required /></label>
    <label className="full">Supporting invoice<input type="file" accept=".pdf,.png,.jpg,.jpeg" /></label>
    {!eligibleOrders.length ? <div className="full validation-message">No completed, uninvoiced work orders are available{practice ? ` for ${practice}` : ""}.</div> : null}
    <div className="full form-note">Submission creates an auditable invoice for GAP finance review. No data is sent to Coupa.</div>
  </div>;
}
