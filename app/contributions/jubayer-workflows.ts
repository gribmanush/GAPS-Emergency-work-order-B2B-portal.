/**
 * Team JAM contribution target: JUBAYER ALAM
 * Jira: TJ-30 Emergency Work Order Form; TJ-34 Tax Invoice page.
 *
 * Evidence rule: Jubayer should review, explain, test and commit this file himself.
 */
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
  const quantity = Number(data.quantity || 1);
  const unitPrice = Number(data.unitPrice || 0);
  const gstRate = Number(data.gstRate || 10);
  const subtotal = Math.round(quantity * unitPrice * 100) / 100;
  const gst = Math.round(subtotal * (gstRate / 100) * 100) / 100;
  const amount = Math.round((subtotal + gst) * 100) / 100;
  const submittedAt = new Date().toISOString();
  return {
    id: `INV-${sequence}`,
    workOrder: String(data.workOrder),
    practice: String(data.practice || "Sydney Animal Emergency"),
    supplierId: String(data.supplierId || "SUP-1048"),
    invoiceNumber: String(data.invoiceNumber || `VET-${sequence}`),
    invoiceDate: String(data.invoiceDate),
    dueDate: String(data.dueDate),
    currency: "AUD" as const,
    subtotal,
    gst,
    amount,
    status: "Submitted",
    version: 1,
    date: new Date().toLocaleDateString("en-AU"),
    lineItems: [{
      description: String(data.description || "Emergency veterinary treatment"),
      quantity,
      unitPrice,
      gstRate,
      netAmount: subtotal,
      gstAmount: gst,
      grossAmount: amount,
    }],
    attachmentName: typeof File !== "undefined" && data.attachment instanceof File ? data.attachment.name : undefined,
    submittedBy: String(data.submittedBy || "Veterinary Practice"),
    submittedAt,
  };
}
