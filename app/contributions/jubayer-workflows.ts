/**
 * Team JAM contribution target: JUBAYER ALAM
 * Jira: TJ-30 Emergency Work Order Form; TJ-34 Tax Invoice page.
 *
 * Evidence rule: Jubayer should review, explain, test and commit this file himself.
 */
import { calculateLineItem } from "../features/invoices/invoice-workflow";
export const JUBAYER_JIRA_ITEMS = ["TJ-30", "TJ-34"] as const;

export function createEmergencyWorkOrder(data: Record<string, FormDataEntryValue>, sequence: number) {
  return {
    id: `WO-2026-${sequence}`,
    incident: String(data.incident || "INC-2026-NEW"),
    dogs: String(data.dogs || "New greyhound").split(",").map((name) => name.trim()).filter(Boolean),
    priority: String(data.priority || "Moderate"),
    practice: String(data.practice || "Unassigned"),
    status: data.practice ? "Awaiting Acknowledgement" : "Draft",
    due: String(data.due || "Not set"),
    limit: Number(data.limit || 0),
    service: String(data.service || "Emergency consultation"),
    updated: "Just now",
    notes: String(data.notes || ""),
  };
}

export function createTaxInvoice(data: Record<string, FormDataEntryValue>, sequence: number) {
  const invoiceDate = String(data.invoiceDate);
  const lineItem = calculateLineItem(
    String(data.description),
    Number(data.quantity),
    Number(data.unitPrice),
    Number(data.gstRate),
  );
  return {
    id: `INV-${sequence}`,
    workOrder: String(data.workOrder),
    practice: String(data.practice),
    supplierId: String(data.supplierId),
    invoiceNumber: String(data.invoiceNumber),
    invoiceDate,
    dueDate: String(data.dueDate),
    currency: "AUD" as const,
    subtotal: lineItem.netAmount,
    gst: lineItem.gstAmount,
    amount: lineItem.grossAmount,
    status: "Submitted",
    version: 1,
    date: new Date(`${invoiceDate}T00:00:00`).toLocaleDateString("en-AU"),
    lineItems: [lineItem],
    attachmentName: data.attachment instanceof File ? data.attachment.name : undefined,
    submittedBy: String(data.submittedBy),
    submittedAt: new Date().toISOString(),
  };
}
