/**
 * Team JAM contribution: JUBAYER ALAM
 * "Submit veterinary invoice" modal fields (tax invoice capture).
 */
"use client";

import { useMemo, useState } from "react";
import type { Invoice, WorkOrder } from "../../shared/types";

const supplierIds: Record<string, string> = {
  "Sydney Animal Emergency": "SUP-1048",
  "North Shore Veterinary Hospital": "SUP-1102",
  "Western Sydney Vet Care": "SUP-1176",
  "Inner West Animal Hospital": "SUP-1208",
};

export function InvoiceForm({
  orders,
  invoices,
  practice,
}: {
  orders: WorkOrder[];
  invoices: Invoice[];
  practice: string;
}) {
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [gstRate, setGstRate] = useState(10);
  const [today] = useState(() => new Date().toISOString().slice(0, 10));
  const [defaultDue] = useState(() => new Date(new Date().getTime() + 30 * 86400000).toISOString().slice(0, 10));
  const eligibleOrders = useMemo(() => orders.filter(order => {
    const correctPractice = practice ? order.practice === practice : true;
    const completed = ["Completed by Vet", "Closed"].includes(order.status);
    const alreadyInvoiced = invoices.some(invoice => invoice.workOrder === order.id && invoice.status !== "Rejected");
    return correctPractice && completed && !alreadyInvoiced;
  }), [orders, invoices, practice]);
  const subtotal = Math.round(quantity * unitPrice * 100) / 100;
  const gst = Math.round(subtotal * (gstRate / 100) * 100) / 100;
  const total = Math.round((subtotal + gst) * 100) / 100;

  return <div className="form-grid">
    <input type="hidden" name="practice" value={practice} />
    <input type="hidden" name="supplierId" value={supplierIds[practice] || "SUP-PENDING"} />
    <label>Completed work order<select name="workOrder" required disabled={!eligibleOrders.length}><option value="">Select a work order</option>{eligibleOrders.map(order => <option key={order.id} value={order.id}>{order.id} — {order.dogs.join(", ")}</option>)}</select></label>
    <label>Supplier invoice number<input name="invoiceNumber" required maxLength={50} placeholder="e.g. SAE-20491" /></label>
    <label>Invoice date<input name="invoiceDate" type="date" defaultValue={today} max={today} required /></label>
    <label>Payment due date<input name="dueDate" type="date" defaultValue={defaultDue} min={today} required /></label>
    <label className="full">Treatment description<input name="description" required maxLength={180} placeholder="Emergency consultation, imaging and treatment" /></label>
    <label>Quantity<input name="quantity" type="number" min="1" step="1" value={quantity} onChange={event => setQuantity(Number(event.target.value))} required /></label>
    <label>Unit price excluding GST (AUD)<input name="unitPrice" type="number" min="0.01" step="0.01" value={unitPrice || ""} onChange={event => setUnitPrice(Number(event.target.value))} required /></label>
    <label>GST rate<select name="gstRate" value={gstRate} onChange={event => setGstRate(Number(event.target.value))}><option value="10">10% GST</option><option value="0">GST free</option></select></label>
    <div className="invoice-total" aria-live="polite"><small>Calculated total</small><b>A${total.toFixed(2)}</b><span>Net A${subtotal.toFixed(2)} + GST A${gst.toFixed(2)}</span></div>
    <label className="full">Supporting tax invoice<input name="attachment" type="file" accept=".pdf,.png,.jpg,.jpeg" required /><small>PDF, PNG or JPG. The current build records the filename; connect Firebase Storage before using real documents.</small></label>
    {!eligibleOrders.length ? <div className="full validation-message">No completed, uninvoiced work orders are available for {practice || "this practice"}.</div> : null}
    <div className="full form-note">Submitting creates an auditable Firestore invoice for GAP finance review. External export is available only after GAP approval.</div>
  </div>;
}
