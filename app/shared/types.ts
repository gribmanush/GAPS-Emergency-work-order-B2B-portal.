export type Role = "GAP Administrator" | "GAP Case Manager" | "Veterinary Practice" | "Finance Approver" | "GRNSW Auditor";

export type VetSpecialty = "Small Animals" | "Equine" | "Livestock" | "Exotic" | "Surgery";
export const vetSpecialties: VetSpecialty[] = ["Small Animals", "Equine", "Livestock", "Exotic", "Surgery"];

// Every signed-up account's profile is stored in Firestore under a role-specific
// collection (see ROLE_COLLECTIONS below), not one shared collection — a genuine
// separate "table" per role rather than one table with mixed, mostly-empty fields.
// Vet-only and staff-only fields are optional since only one set applies per role.
export type UserProfile = {
  uid: string;
  email: string;
  fullName: string;
  phone: string;
  role: Role;
  // Veterinary Practice only
  practice?: string;
  licenseNumber?: string;
  specialty?: VetSpecialty;
  deaNumber?: string;
  emergencyContact?: string;
  // Every other role (GAP staff)
  employeeId?: string;
  branch?: string;
};

// The real, final work order lifecycle. A work order can only ever move to the
// exact next stage — never skipped ahead, never rolled back.
export type WorkOrderStatus =
  | "Work Order Created and Assigned"
  | "Accepted by Vet"
  | "Treatment in Progress"
  | "Veterinary Work Completed"
  | "GAP Review"
  | "Closed";

export const WORK_ORDER_SEQUENCE: WorkOrderStatus[] = [
  "Work Order Created and Assigned",
  "Accepted by Vet",
  "Treatment in Progress",
  "Veterinary Work Completed",
  "GAP Review",
  "Closed",
];

export function workOrderStageIndex(status: WorkOrderStatus): number {
  return WORK_ORDER_SEQUENCE.indexOf(status);
}

// Only the exact next stage is ever a legal move.
export function canAdvanceWorkOrder(from: WorkOrderStatus, to: WorkOrderStatus): boolean {
  return workOrderStageIndex(to) === workOrderStageIndex(from) + 1;
}

export function isWorkOrderStageAtLeast(status: WorkOrderStatus, target: WorkOrderStatus): boolean {
  return workOrderStageIndex(status) >= workOrderStageIndex(target);
}

export type WorkOrder = {
  id: string; incident: string; dogs: string[]; priority: string; practice: string;
  status: WorkOrderStatus; due: string; limit: number; service: string; updated: string; notes: string;
  // A work order is assigned to one specific vet account, not just a practice.
  assignedVetUid: string;
  assignedVetName: string;
  // Set when the assigned vet rejects the work — it stays at "Work Order Created
  // and Assigned" but is pulled from that vet's access until GAP reassigns it.
  needsReassignment?: boolean;
};

// A vet can only ever see/act on work orders currently assigned to their own
// account. A rejected, not-yet-reassigned order belongs to no vet. Every other
// role keeps full visibility across every practice and vet.
export function canAccessWorkOrder(session: Pick<UserProfile, "role" | "uid">, order: WorkOrder): boolean {
  if (session.role !== "Veterinary Practice") return true;
  if (order.needsReassignment) return false;
  return order.assignedVetUid === session.uid;
}

// A vet only sees a work order in their own worklist once they've accepted it —
// before that, it exists only as the assignment notification (accept/reject).
export function isWorkOrderInVetWorklist(session: Pick<UserProfile, "role" | "uid">, order: WorkOrder): boolean {
  if (!canAccessWorkOrder(session, order)) return false;
  return session.role !== "Veterinary Practice" || order.status !== "Work Order Created and Assigned";
}

// A vet can only ever see/act on other records (invoices) belonging to their own
// practice. Every other role keeps full visibility. No practice tag = visible to everyone.
export function isVisibleToSession(session: Pick<UserProfile, "role" | "practice">, recordPractice?: string): boolean {
  if (session.role !== "Veterinary Practice") return true;
  if (!recordPractice) return true;
  return Boolean(session.practice) && recordPractice === session.practice;
}

export type Invoice = { id: string; workOrder: string; practice: string; amount: number; status: string; version: number; date: string };

export type Notice = {
  id: string; text: string; time: string; read: boolean;
  practice?: string;
  recipientUid?: string; // set for a notice meant for exactly one person (e.g. "you've been assigned this")
  staffOnly?: boolean; // set for a notice meant for any GAP staff role, never a vet
  workOrderId?: string; // lets clicking the notice open the related work order
};

// Priority: a personally-addressed notice beats everything else; a staff-only
// notice is never shown to a vet; anything else falls back to practice visibility.
export function isNoticeVisible(session: Pick<UserProfile, "role" | "uid" | "practice">, notice: Pick<Notice, "recipientUid" | "staffOnly" | "practice">): boolean {
  if (notice.recipientUid) return notice.recipientUid === session.uid;
  if (notice.staffOnly) return session.role !== "Veterinary Practice";
  return isVisibleToSession(session, notice.practice);
}

export type Audit = { id: string; time: string; user: string; role: string; action: string; record: string };

export type Incident = {
  id: string; occurredAt: string; type: string; location: string;
  greyhoundCount: number; priority: string; status: string; summary?: string;
};

export type Greyhound = {
  id: string; // GAP reference, e.g. GAP-2918
  petName: string; racingName: string; microchip: string; status: string; healthAlerts: string;
};

export type Practice = {
  id: string; // document id — the practice name, since that's the key used everywhere else
  name: string; approval: string; operations: string; coverage: string; supplierRef: string; avgResponse: string;
};

// The Directory/Incidents/Greyhounds/Practices UI components render plain
// string[][] rows — these adapters keep that view layer untouched while the
// storage layer underneath is fully typed Firestore documents.
export const incidentToRow = (i: Incident): string[] => [i.id, i.occurredAt, i.type, i.location, String(i.greyhoundCount), i.priority, i.status];
export const greyhoundToRow = (g: Greyhound): string[] => [g.id, g.petName, g.racingName, g.microchip, g.status, g.healthAlerts];
export const practiceToRow = (p: Practice): string[] => [p.name, p.approval, p.operations, p.coverage, p.supplierRef, p.avgResponse];

// One top-level Firestore collection per data domain — every operational
// record is genuine, shared, cross-browser Firestore data, not local state.
export const DATA_COLLECTIONS = {
  workOrders: "workOrders",
  invoices: "invoices",
  incidents: "incidents",
  greyhounds: "greyhounds",
  practices: "practices",
  notifications: "notifications",
  auditLog: "auditLog",
} as const;

export const roles: Role[] = ["GAP Administrator", "GAP Case Manager", "Veterinary Practice", "Finance Approver", "GRNSW Auditor"];

// One Firestore collection per role — a signed-up account's full profile lives
// in exactly one of these five, decided permanently by the role chosen at sign-up.
export const ROLE_COLLECTIONS: Record<Role, string> = {
  "GAP Administrator": "gapAdministrators",
  "GAP Case Manager": "gapCaseManagers",
  "Veterinary Practice": "veterinaryPractices",
  "Finance Approver": "financeApprovers",
  "GRNSW Auditor": "grnswAuditors",
};

// Fallback role lookup for accounts created directly in the Firebase console
// (e.g. demo accounts) rather than through the app's sign-up form, which has
// no Firestore profile document to read a role from otherwise.
export const accounts: Record<string, { role: Role; name: string }> = {
  "admin@gap-demo.nsw": { role: "GAP Administrator", name: "Alex Morgan" },
  "manager@gap-demo.nsw": { role: "GAP Case Manager", name: "Jordan Lee" },
  "vet@gap-demo.nsw": { role: "Veterinary Practice", name: "Dr Mia Chen" },
  "finance@gap-demo.nsw": { role: "Finance Approver", name: "Sam Taylor" },
  "auditor@grnsw-demo.nsw": { role: "GRNSW Auditor", name: "Chris Patel" },
};

export const nav = [
  ["dashboard","▦","Dashboard"], ["incidents","⚠","Emergency Incidents"], ["work-orders","▤","Work Orders"],
  ["greyhounds","◇","Greyhounds"], ["practices","✚","Veterinary Practices"], ["invoices","$","Invoices"],
  ["notifications","●","Notifications"], ["reports","▥","Reports"], ["audit","◷","Audit Log"],
  ["users","♙","User Administration"], ["settings","⚙","Settings"], ["help","?","Help & Support"],
];

export const restricted: Record<string, Role[]> = {
  users:["GAP Administrator"], settings:["GAP Administrator"], audit:["GAP Administrator","GRNSW Auditor"],
  reports:["GAP Administrator","GAP Case Manager","Finance Approver","GRNSW Auditor"],
  practices:["GAP Administrator","GAP Case Manager","GRNSW Auditor"], incidents:["GAP Administrator","GAP Case Manager","GRNSW Auditor"],
};

export const money = (n:number) => new Intl.NumberFormat("en-AU",{style:"currency",currency:"AUD"}).format(n);
export const badge = (s:string) => `badge ${s.toLowerCase().replaceAll(" ","-").replaceAll("—","")}`;
