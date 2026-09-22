/**
 * Team JAM contribution: AANAY VARTAK
 * Jira: TJ-51, TJ-75, TJ-76 and TJ-77.
 */
import type { Notice, Role, WorkOrder } from "../shared/types";

export const AANAY_SPRINT4_JIRA_ITEMS = ["TJ-51", "TJ-75", "TJ-76", "TJ-77"] as const;

const priorityRank: Record<string, number> = { Critical: 0, Urgent: 1, Moderate: 2, Routine: 3 };

export function sortVeterinaryTasks(orders: WorkOrder[]) {
  return [...orders].sort((left, right) => {
    const priorityDifference = (priorityRank[left.priority] ?? 9) - (priorityRank[right.priority] ?? 9);
    return priorityDifference || left.id.localeCompare(right.id);
  });
}

export function veterinaryTaskCounts(orders: WorkOrder[]) {
  return {
    newAssignments: orders.filter(order => order.status === "Awaiting Acknowledgement").length,
    acknowledged: orders.filter(order => order.status === "Acknowledged").length,
    inTreatment: orders.filter(order => order.status === "In Progress").length,
    completed: orders.filter(order => order.status === "Completed by Vet").length,
  };
}

export function createPortalNotice(input: {
  text: string;
  category: NonNullable<Notice["category"]>;
  route: string;
  recordId: string;
  audience: Role[];
}, id = Date.now()): Notice {
  return { id, ...input, time: "Just now", read: false };
}

export function visibleNotices(notices: Notice[], role: Role) {
  return notices.filter(notice => !notice.audience?.length || notice.audience.includes(role));
}

export function createVeterinaryPracticeRow(data: Record<string, FormDataEntryValue>) {
  const name = String(data.tradingName || data.legalName).trim();
  if (!name) throw new Error("A legal or trading name is required.");
  if (!String(data.contactName).trim()) throw new Error("A veterinary contact name is required.");
  if (!String(data.licenseNumber).trim()) throw new Error("A veterinary registration number is required.");
  return [
    name,
    String(data.contactName).trim(),
    String(data.licenseNumber).trim(),
    String(data.approval || "Pending"),
    String(data.operations || "Inactive"),
    String(data.coverage || "Business hours"),
    String(data.supplierReference || "Not mapped"),
    "—",
  ];
}

export function createEmergencyIncidentRow(data: Record<string, FormDataEntryValue>, id: string) {
  const greyhoundCount = Number(data.greyhoundCount);
  if (!Number.isInteger(greyhoundCount) || greyhoundCount < 1) {
    throw new Error("Enter at least one affected greyhound.");
  }
  const occurredAt = String(data.occurredAt);
  if (!occurredAt) throw new Error("The incident date and time are required.");
  return [
    id,
    new Date(occurredAt).toLocaleString("en-AU"),
    String(data.type),
    `${String(data.suburb).trim()} NSW ${String(data.postcode).trim()}`,
    String(greyhoundCount),
    String(data.priority),
    "Draft",
  ];
}
