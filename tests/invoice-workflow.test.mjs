import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCoupaReadyPayload,
  calculateLineItem,
  canTransitionInvoice,
  serializeFinanceExport,
  validateInvoiceSubmission,
} from "../app/features/invoices/invoice-workflow.ts";

const order = {
  id: "WO-1", incident: "INC-1", dogs: ["Nova"], priority: "Urgent",
  practice: "Sydney Animal Emergency", status: "Completed by Vet", due: "Completed",
  limit: 2000, service: "Emergency imaging", updated: "Now", notes: "",
};

function approvedInvoice() {
  const line = calculateLineItem("Emergency imaging", 2, 500, 10);
  return {
    id: "INV-1", workOrder: "WO-1", practice: "Sydney Animal Emergency",
    supplierId: "SUP-1048", invoiceNumber: "SAE-1001", invoiceDate: "2026-09-08",
    dueDate: "2026-10-08", currency: "AUD", subtotal: line.netAmount,
    gst: line.gstAmount, amount: line.grossAmount, status: "Approved — Ready for export",
    version: 1, date: "8 Sep 2026", lineItems: [line], submittedBy: "Dr Mia Chen",
    submittedAt: "2026-09-08T01:00:00.000Z", reviewedBy: "Sam Taylor",
    reviewedAt: "2026-09-08T02:00:00.000Z",
  };
}

test("calculates GST and gross total exactly", () => {
  assert.deepEqual(calculateLineItem("X-ray", 2, 125.55, 10), {
    description: "X-ray", quantity: 2, unitPrice: 125.55, gstRate: 10,
    netAmount: 251.1, gstAmount: 25.11, grossAmount: 276.21,
  });
});

test("enforces the approval state machine", () => {
  assert.equal(canTransitionInvoice("Submitted", "Under Review"), true);
  assert.equal(canTransitionInvoice("Under Review", "Approved — Ready for export"), true);
  assert.equal(canTransitionInvoice("Submitted", "Exported"), false);
  assert.equal(canTransitionInvoice("Exported", "Submitted"), false);
});

test("validates eligible work orders and duplicate supplier numbers", () => {
  const invoice = { ...approvedInvoice(), status: "Submitted" };
  assert.deepEqual(validateInvoiceSubmission(invoice, order, []), []);
  const duplicate = { ...invoice, id: "INV-2" };
  assert.match(validateInvoiceSubmission(duplicate, order, [invoice]).join(" "), /already been submitted/);
  assert.match(validateInvoiceSubmission(invoice, { ...order, status: "In Progress" }, []).join(" "), /must be completed/);
});

test("builds Coupa-ready JSON and CSV only after approval", () => {
  const invoice = approvedInvoice();
  const payload = buildCoupaReadyPayload(invoice, "2026-09-08T03:00:00.000Z");
  assert.equal(payload.externalReference, "INV-1-V1");
  assert.equal(payload.supplier.supplierNumber, "SUP-1048");
  assert.equal(payload.invoice.purchaseOrderReference, "WO-1");
  assert.equal(payload.invoice.grossTotal, 1100);
  assert.match(serializeFinanceExport(invoice, "csv").content, /"SUP-1048"/);
  assert.throws(() => buildCoupaReadyPayload({ ...invoice, status: "Submitted" }), /Only approved invoices/);
});
