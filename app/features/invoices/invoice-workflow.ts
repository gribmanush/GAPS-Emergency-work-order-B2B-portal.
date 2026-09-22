import type {
  FinanceExportFormat,
  Invoice,
  InvoiceLineItem,
  InvoiceStatus,
  Role,
  WorkOrder,
} from "../../shared/types";

export const invoiceStatuses: InvoiceStatus[] = [
  "Submitted",
  "Under Review",
  "Approved — Ready for export",
  "Rejected",
  "Exported",
];

const allowedTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
  Submitted: ["Under Review", "Approved — Ready for export", "Rejected"],
  "Under Review": ["Approved — Ready for export", "Rejected"],
  "Approved — Ready for export": ["Exported"],
  Rejected: ["Submitted"],
  Exported: [],
};

export function canTransitionInvoice(from: InvoiceStatus, to: InvoiceStatus) {
  return allowedTransitions[from].includes(to);
}

export function assertFinanceReviewer(role: Role) {
  if (role !== "Finance Approver" && role !== "GAP Administrator") {
    throw new Error("Only a GAP finance approver or administrator can review invoices.");
  }
}

export function assertInvoiceTransition(from: InvoiceStatus, to: InvoiceStatus) {
  if (!canTransitionInvoice(from, to)) {
    throw new Error(`Invoice cannot move from ${from} to ${to}.`);
  }
}

export function calculateLineItem(
  description: string,
  quantity: number,
  unitPrice: number,
  gstRate = 10,
): InvoiceLineItem {
  const netAmount = roundMoney(quantity * unitPrice);
  const gstAmount = roundMoney(netAmount * (gstRate / 100));
  return {
    description: description.trim(),
    quantity,
    unitPrice: roundMoney(unitPrice),
    gstRate,
    netAmount,
    gstAmount,
    grossAmount: roundMoney(netAmount + gstAmount),
  };
}

export function validateInvoiceSubmission(
  invoice: Invoice,
  workOrder: WorkOrder | undefined,
  existingInvoices: Invoice[],
) {
  const errors: string[] = [];
  if (!workOrder) errors.push("The selected work order does not exist.");
  if (workOrder && !["Completed by Vet", "Closed"].includes(workOrder.status)) {
    errors.push("The veterinary work must be completed before an invoice is submitted.");
  }
  if (workOrder && workOrder.practice !== invoice.practice) {
    errors.push("The invoice practice must match the practice assigned to the work order.");
  }
  if (!invoice.invoiceNumber.trim()) errors.push("The supplier invoice number is required.");
  if (!invoice.supplierId.trim()) errors.push("The supplier ID is required.");
  if (!invoice.invoiceDate) errors.push("The invoice date is required.");
  if (!invoice.dueDate) errors.push("The due date is required.");
  if (invoice.invoiceDate && invoice.dueDate && invoice.dueDate < invoice.invoiceDate) {
    errors.push("The due date cannot be earlier than the invoice date.");
  }
  if (!invoice.lineItems.length || invoice.lineItems.some(item => !item.description || item.quantity <= 0 || item.unitPrice < 0)) {
    errors.push("At least one valid invoice line is required.");
  }
  if (invoice.amount <= 0) errors.push("The invoice total must be greater than zero.");

  const duplicate = existingInvoices.some(
    item =>
      item.id !== invoice.id &&
      item.practice === invoice.practice &&
      item.invoiceNumber.toLowerCase() === invoice.invoiceNumber.toLowerCase() &&
      item.status !== "Rejected",
  );
  if (duplicate) errors.push("This supplier invoice number has already been submitted.");
  return errors;
}

export function buildCoupaReadyPayload(invoice: Invoice, generatedAt = new Date().toISOString()) {
  if (invoice.status !== "Approved — Ready for export" && invoice.status !== "Exported") {
    throw new Error("Only approved invoices can be exported.");
  }
  return {
    schemaVersion: "1.0",
    exportType: "SupplierInvoice",
    sourceSystem: "GAP Emergency Portal",
    externalReference: `${invoice.id}-V${invoice.version}`,
    supplier: { supplierNumber: invoice.supplierId, name: invoice.practice },
    invoice: {
      invoiceId: invoice.id,
      supplierInvoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      currency: invoice.currency,
      purchaseOrderReference: invoice.workOrder,
      netTotal: roundMoney(invoice.subtotal),
      taxTotal: roundMoney(invoice.gst),
      grossTotal: roundMoney(invoice.amount),
      lines: invoice.lineItems.map((item, index) => ({
        lineNumber: index + 1,
        description: item.description,
        quantity: item.quantity,
        unitPrice: roundMoney(item.unitPrice),
        taxRate: item.gstRate,
        netAmount: roundMoney(item.netAmount),
        taxAmount: roundMoney(item.gstAmount),
        grossAmount: roundMoney(item.grossAmount),
      })),
    },
    approval: {
      approvedBy: invoice.reviewedBy ?? "GAP Finance",
      approvedAt: invoice.reviewedAt ?? generatedAt,
      comment: invoice.reviewComment ?? "Approved for finance-system export",
    },
    generatedAt,
  };
}

export function serializeFinanceExport(invoice: Invoice, format: FinanceExportFormat) {
  const payload = buildCoupaReadyPayload(invoice);
  if (format === "json") {
    return {
      content: JSON.stringify(payload, null, 2),
      mimeType: "application/json",
      extension: "json",
      externalReference: payload.externalReference,
    };
  }

  const headers = [
    "external_reference", "supplier_number", "supplier_name", "supplier_invoice_number",
    "invoice_date", "due_date", "currency", "purchase_order_reference", "line_number",
    "description", "quantity", "unit_price", "tax_rate", "net_amount", "tax_amount", "gross_amount",
  ];
  const rows = payload.invoice.lines.map(line => [
    payload.externalReference,
    payload.supplier.supplierNumber,
    payload.supplier.name,
    payload.invoice.supplierInvoiceNumber,
    payload.invoice.invoiceDate,
    payload.invoice.dueDate,
    payload.invoice.currency,
    payload.invoice.purchaseOrderReference,
    line.lineNumber,
    line.description,
    line.quantity,
    line.unitPrice,
    line.taxRate,
    line.netAmount,
    line.taxAmount,
    line.grossAmount,
  ]);
  return {
    content: [headers, ...rows].map(row => row.map(csvCell).join(",")).join("\n"),
    mimeType: "text/csv;charset=utf-8",
    extension: "csv",
    externalReference: payload.externalReference,
  };
}

function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
