export type Role =
  | "GAP Administrator"
  | "GAP Case Manager"
  | "Veterinary Practice"
  | "Finance Approver"
  | "GRNSW Auditor";

export type Session = {
  email: string;
  role: Role;
  name: string;
  practice?: string;
};

export type WorkOrder = {
  id: string;
  incident: string;
  dogs: string[];
  priority: string;
  practice: string;
  status: string;
  due: string;
  limit: number;
  service: string;
  updated: string;
  notes: string;
};

export type Invoice = {
  id: string;
  workOrder: string;
  practice: string;
  amount: number;
  status: string;
  version: number;
  date: string;
};

export type Notice = {
  id: number;
  text: string;
  time: string;
  read: boolean;
};

export type Audit = {
  id: number;
  time: string;
  user: string;
  role: string;
  action: string;
  record: string;
};

export const roles: Role[] = [
  "GAP Administrator",
  "GAP Case Manager",
  "Veterinary Practice",
  "Finance Approver",
  "GRNSW Auditor",
];

export const accounts: Record<string, Omit<Session, "email">> = {
  "admin@gap-demo.nsw": {
    role: "GAP Administrator",
    name: "Alex Morgan",
  },
  "manager@gap-demo.nsw": {
    role: "GAP Case Manager",
    name: "Jordan Lee",
  },
  "vet@gap-demo.nsw": {
    role: "Veterinary Practice",
    name: "Dr Mia Chen",
    practice: "Sydney Animal Emergency",
  },
  "finance@gap-demo.nsw": {
    role: "Finance Approver",
    name: "Sam Taylor",
  },
  "auditor@grnsw-demo.nsw": {
    role: "GRNSW Auditor",
    name: "Chris Patel",
  },
};

export function canAccessWorkOrder(
  session: Session,
  order: WorkOrder,
): boolean {
  if (session.role !== "Veterinary Practice") {
    return true;
  }

  return (
    Boolean(session.practice) &&
    order.practice === session.practice
  );
}

export const nav = [
  ["dashboard", "▦", "Dashboard"],
  ["incidents", "⚠", "Emergency Incidents"],
  ["work-orders", "▤", "Work Orders"],
  ["greyhounds", "◇", "Greyhounds"],
  ["practices", "✚", "Veterinary Practices"],
  ["invoices", "$", "Invoices"],
  ["notifications", "●", "Notifications"],
  ["reports", "▥", "Reports"],
  ["audit", "◷", "Audit Log"],
  ["users", "♙", "User Administration"],
  ["settings", "⚙", "Settings"],
  ["help", "?", "Help & Support"],
];

export const restricted: Record<string, Role[]> = {
  users: ["GAP Administrator"],
  settings: ["GAP Administrator"],
  audit: ["GAP Administrator", "GRNSW Auditor"],
  reports: [
    "GAP Administrator",
    "GAP Case Manager",
    "Finance Approver",
    "GRNSW Auditor",
  ],
  practices: [
    "GAP Administrator",
    "GAP Case Manager",
    "GRNSW Auditor",
  ],
  incidents: [
    "GAP Administrator",
    "GAP Case Manager",
    "GRNSW Auditor",
  ],
};

export const money = (value: number) =>
  new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(value);

export const badge = (status: string) =>
  `badge ${status
    .toLowerCase()
    .replaceAll(" ", "-")
    .replaceAll("—", "")}`;
