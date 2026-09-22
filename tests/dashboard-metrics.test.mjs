import assert from "node:assert/strict";
import test from "node:test";

import { buildDashboardMetrics, buildStatusDistribution, filterDashboardOrders } from "../app/contributions/aanay-dashboards.ts";

const order = (id, practice, status) => ({ id, practice, status, incident: "INC-1", dogs: ["Test"], priority: "Urgent", due: "Today", limit: 1000, service: "Care", updated: "Now", notes: "" });
const invoice = (workOrder, practice, status, amount) => ({ id: `INV-${workOrder}`, workOrder, practice, status, amount, supplierId: "SUP-1", invoiceNumber: "N-1", invoiceDate: "2026-09-01", dueDate: "2026-10-01", currency: "AUD", subtotal: amount, gst: 0, version: 1, date: "1 Sep 2026", lineItems: [], submittedBy: practice, submittedAt: "2026-09-01T00:00:00.000Z" });

const orders = [
  order("WO-1", "Practice A", "Awaiting Acknowledgement"),
  order("WO-2", "Practice A", "In Progress"),
  order("WO-3", "Practice A", "Completed by Vet"),
  order("WO-4", "Practice B", "Declined"),
  order("WO-5", "Practice B", "Closed"),
];
const invoices = [
  invoice("WO-1", "Practice A", "Submitted", 110),
  invoice("WO-4", "Practice B", "Approved — Coupa pending", 220),
];

test("GAP dashboard metrics are calculated from current records", () => {
  assert.deepEqual(buildDashboardMetrics("GAP Administrator", orders, invoices).map(metric => metric[1]), [4, 1, 1, 2]);
});

test("vet dashboard is restricted to the authenticated practice", () => {
  assert.deepEqual(filterDashboardOrders("Veterinary Practice", orders, "Practice A").map(item => item.id), ["WO-1", "WO-2", "WO-3"]);
  assert.deepEqual(buildDashboardMetrics("Veterinary Practice", orders, invoices, "Practice A").map(metric => metric[1]), [1, 1, 1, 1]);
});

test("vet dashboard fails closed when the profile has no practice", () => {
  assert.deepEqual(filterDashboardOrders("Veterinary Practice", orders), []);
  assert.deepEqual(buildDashboardMetrics("Veterinary Practice", orders, invoices).map(metric => metric[1]), [0, 0, 0, 0]);
});

test("status distribution is dynamic rather than hard-coded", () => {
  assert.deepEqual(buildStatusDistribution(orders), { open: 4, active: 1, awaiting: 1, actionNeeded: 2 });
});
