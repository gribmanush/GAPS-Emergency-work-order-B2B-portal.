import assert from "node:assert/strict";
import test from "node:test";

import {
  assertFinanceReviewer,
  assertInvoiceTransition,
  buildCoupaReadyPayload,
  calculateLineItem,
  serializeFinanceExport,
  validateInvoiceSubmission,
} from "../app/features/invoices/invoice-workflow.ts";

const line = calculateLineItem("Emergency consultation", 2, 100, 10);
const invoice = {
  id: "INV-1001",
  workOrder: "WO-1001",
  practice: "Sydney Animal Emergency",
  supplierId: "SUP-1048",
  invoiceNumber: "SAE-1001",
  invoiceDate: "2026-09-20",
  dueDate: "2026-10-20",
  currency: "AUD",
  subtotal: 200,
  gst: 20,
  amount: 220,
  status: "Approved — Ready for export",
  version: 1,
  date: "2026-09-20",
  lineItems: [line],
  submittedBy: "Dr Mia Chen",
  submittedAt: "2026-09-20T10:00:00.000Z",
  reviewedBy: "Sam Taylor",
  reviewedAt: "2026-09-21T10:00:00.000Z",
};
const workOrder = {
  id: "WO-1001",
  incident: "INC-1001",
  dogs: ["GAP Rocket"],
  priority: "Urgent",
  practice: "Sydney Animal Emergency",
  status: "Completed by Vet",
  due: "2026-09-20",
  limit: 2500,
  service: "Emergency consultation",
  updated: "2026-09-20",
  notes: "",
};

test("calculates net, GST and gross values to currency precision", () => {
  assert.deepEqual(line, {
    description: "Emergency consultation",
    quantity: 2,
    unitPrice: 100,
    gstRate: 10,
    netAmount: 200,
    gstAmount: 20,
    grossAmount: 220,
  });
});

test("enforces finance roles and invoice status transitions", () => {
  assert.doesNotThrow(() => assertFinanceReviewer("Finance Approver"));
  assert.doesNotThrow(() => assertFinanceReviewer("GAP Administrator"));
  assert.throws(() => assertFinanceReviewer("Veterinary Practice"), /finance approver/i);
  assert.doesNotThrow(() => assertInvoiceTransition("Submitted", "Approved — Ready for export"));
  assert.throws(() => assertInvoiceTransition("Submitted", "Exported"), /cannot move/i);
});

test("validates eligible work orders and duplicate supplier invoice numbers", () => {
  assert.deepEqual(validateInvoiceSubmission(invoice, workOrder, []), []);
  const errors = validateInvoiceSubmission(invoice, workOrder, [{ ...invoice, id: "INV-OTHER", status: "Submitted" }]);
  assert.ok(errors.some(error => /already been submitted/i.test(error)));
});

test("builds traceable Coupa-ready JSON and CSV without calling Coupa", () => {
  const payload = buildCoupaReadyPayload(invoice, "2026-09-22T00:00:00.000Z");
  assert.equal(payload.externalReference, "INV-1001-V1");
  assert.equal(payload.supplier.supplierNumber, "SUP-1048");
  assert.equal(payload.invoice.purchaseOrderReference, "WO-1001");
  assert.equal(payload.invoice.grossTotal, 220);

  const json = serializeFinanceExport(invoice, "json");
  assert.equal(JSON.parse(json.content).invoice.supplierInvoiceNumber, "SAE-1001");
  const csv = serializeFinanceExport(invoice, "csv");
  assert.match(csv.content, /"external_reference"/);
  assert.match(csv.content, /"INV-1001-V1"/);
});

test("blocks export before GAP approval", () => {
  assert.throws(
    () => buildCoupaReadyPayload({ ...invoice, status: "Submitted" }),
    /Only approved invoices/i,
  );
});
