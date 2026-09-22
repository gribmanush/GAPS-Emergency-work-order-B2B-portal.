import assert from "node:assert/strict";
import test from "node:test";

import {
  createEmergencyIncidentRow,
  createPortalNotice,
  createVeterinaryPracticeRow,
  sortVeterinaryTasks,
  veterinaryTaskCounts,
  visibleNotices,
} from "../app/contributions/aanay-sprint4.ts";

const order = (id, priority, status) => ({ id, priority, status, practice: "Practice A", incident: "INC-1", dogs: ["Test"], due: "Today", limit: 1000, service: "Care", updated: "Now", notes: "" });

test("TJ-51 sorts veterinary tasks by urgency and calculates status totals", () => {
  const orders = [order("WO-2", "Moderate", "In Progress"), order("WO-1", "Critical", "Awaiting Acknowledgement"), order("WO-3", "Urgent", "Completed by Vet")];
  assert.deepEqual(sortVeterinaryTasks(orders).map(item => item.id), ["WO-1", "WO-3", "WO-2"]);
  assert.deepEqual(veterinaryTaskCounts(orders), { newAssignments: 1, acknowledged: 0, inTreatment: 1, completed: 1 });
});

test("TJ-75 routes notifications only to intended roles", () => {
  const notice = createPortalNotice({ text: "New assignment", category: "Assignment", route: "work-orders", recordId: "WO-1", audience: ["Veterinary Practice"] }, 10);
  assert.equal(notice.read, false);
  assert.equal(visibleNotices([notice], "Veterinary Practice").length, 1);
  assert.equal(visibleNotices([notice], "Finance Approver").length, 0);
});

test("TJ-76 keeps veterinary identity and approval data for assignment", () => {
  const row = createVeterinaryPracticeRow({ legalName: "Test Vet Pty Ltd", tradingName: "Test Vet", contactName: "Dr Lee", licenseNumber: "VET-123", approval: "Approved", operations: "Active", coverage: "24-hour", supplierReference: "SUP-123" });
  assert.deepEqual(row, ["Test Vet", "Dr Lee", "VET-123", "Approved", "Active", "24-hour", "SUP-123", "—"]);
});

test("TJ-77 creates a traceable draft emergency case", () => {
  const row = createEmergencyIncidentRow({ occurredAt: "2026-09-22T12:30", type: "Medical emergency", suburb: "Sydney", postcode: "2000", greyhoundCount: "2", priority: "Critical" }, "INC-2026-100");
  assert.equal(row[0], "INC-2026-100");
  assert.equal(row[2], "Medical emergency");
  assert.equal(row[3], "Sydney NSW 2000");
  assert.equal(row[4], "2");
  assert.equal(row[6], "Draft");
});

test("TJ-77 rejects an incident without an affected greyhound", () => {
  assert.throws(() => createEmergencyIncidentRow({ occurredAt: "2026-09-22T12:30", type: "Medical emergency", suburb: "Sydney", postcode: "2000", greyhoundCount: "0", priority: "Critical" }, "INC-2026-100"), /at least one/i);
});
