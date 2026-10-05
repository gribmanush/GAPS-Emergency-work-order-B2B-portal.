import assert from "node:assert/strict";
import test from "node:test";

import { buildEmergencyCase, eligibleVeterinaryProfiles } from "../app/contributions/aanay-sprint5.ts";
import { isNoticeVisible } from "../app/shared/types.ts";

const greyhounds = [
  { id: "GAP-101", petName: "Scout", racingName: "Fast Scout", microchip: "1", status: "In care", healthAlerts: "None" },
  { id: "GAP-102", petName: "Ruby", racingName: "Red Ruby", microchip: "2", status: "In care", healthAlerts: "None" },
];

test("TJ-75 scopes personal and staff notifications to the intended audience", () => {
  const vet = { uid: "vet-1", role: "Veterinary Practice", practice: "Sydney Emergency" };
  const otherVet = { uid: "vet-2", role: "Veterinary Practice", practice: "Sydney Emergency" };
  const staff = { uid: "gap-1", role: "GAP Administrator" };
  assert.equal(isNoticeVisible(vet, { recipientUid: "vet-1" }), true);
  assert.equal(isNoticeVisible(otherVet, { recipientUid: "vet-1" }), false);
  assert.equal(isNoticeVisible(vet, { staffOnly: true }), false);
  assert.equal(isNoticeVisible(staff, { staffOnly: true }), true);
});

test("TJ-76 exposes only licensed vets from approved active practices for assignment", () => {
  const result = eligibleVeterinaryProfiles([
    { uid: "2", fullName: "Zoe Vet", email: "z@example.com", practice: "Approved Vet", licenseNumber: "VET-2" },
    { uid: "1", fullName: "Amy Vet", email: "a@example.com", practice: "Approved Vet", licenseNumber: "VET-1" },
    { uid: "3", fullName: "Pending Vet", email: "p@example.com", practice: "Pending Vet", licenseNumber: "VET-3" },
    { uid: "4", fullName: "No Licence", email: "n@example.com", practice: "Approved Vet" },
  ], [
    { name: "Approved Vet", approval: "Approved", operations: "Active" },
    { name: "Pending Vet", approval: "Pending", operations: "Inactive" },
  ]);
  assert.deepEqual(result.map(vet => vet.uid), ["1", "2"]);
});

test("TJ-77 records all selected greyhounds and traceable reporter details", () => {
  const incident = buildEmergencyCase({
    occurredAt: "2026-10-05T14:30", type: "Medical emergency", priority: "Critical",
    suburb: "Sydney", postcode: "2000", summary: "Two greyhounds require urgent assessment.",
    greyhoundIds: "GAP-101,GAP-102", reporterContact: "0400 000 000",
  }, greyhounds, "Aanay Vartak");
  assert.equal(incident.greyhoundCount, 2);
  assert.deepEqual(incident.greyhoundNames, ["Scout", "Ruby"]);
  assert.deepEqual(incident.greyhoundIds, ["GAP-101", "GAP-102"]);
  assert.equal(incident.reporterName, "Aanay Vartak");
  assert.equal(incident.location, "Sydney NSW 2000");
  assert.equal(incident.status, "Draft");
});

test("TJ-77 refuses an emergency case without an affected greyhound", () => {
  assert.throws(() => buildEmergencyCase({
    occurredAt: "2026-10-05T14:30", type: "Medical emergency", priority: "Urgent",
    suburb: "Sydney", postcode: "2000", summary: "Missing selection", greyhoundIds: "", reporterContact: "test@example.com",
  }, greyhounds, "Aanay Vartak"), /Select at least one affected greyhound/);
});
