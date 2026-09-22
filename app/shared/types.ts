export type Role = "GAP Administrator" | "GAP Case Manager" | "Veterinary Practice" | "Finance Approver" | "GRNSW Auditor";

export type VetSpecialty = "Small Animals" | "Equine" | "Livestock" | "Exotic" | "Surgery";
export const vetSpecialties: VetSpecialty[] = ["Small Animals", "Equine", "Livestock", "Exotic", "Surgery"];

export type StaffJobTitle = "Medical Receptionist" | "Practice Manager" | "Billing Clerk" | "Vet Technician";
export const staffJobTitles: StaffJobTitle[] = ["Medical Receptionist", "Practice Manager", "Billing Clerk", "Vet Technician"];

// Every signed-up account's profile, stored in Firestore at users/{uid}.
// Vet-only and staff-only fields are optional since only one set applies per role.
export type UserProfile = {
  uid: string;
  email: string;
  fullName: string;
  phone: string;
  role: Role;
  // Veterinary Practice only
  licenseNumber?: string;
  specialty?: VetSpecialty;
  deaNumber?: string;
  emergencyContact?: string;
  practiceName?: string;
  // Every other role (GAP staff)
  employeeId?: string;
  jobTitle?: StaffJobTitle;
  branch?: string;
};

export type WorkOrder = {
  id: string; incident: string; dogs: string[]; priority: string; practice: string;
  status: string; due: string; limit: number; service: string; updated: string; notes: string;
};

export type InvoiceStatus =
  | "Submitted"
  | "Under Review"
  | "Approved — Ready for export"
  | "Rejected"
  | "Exported";

export type InvoiceLineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
  netAmount: number;
  gstAmount: number;
  grossAmount: number;
};

export type Invoice = {
  id: string;
  workOrder: string;
  practice: string;
  supplierId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: "AUD";
  subtotal: number;
  gst: number;
  amount: number;
  status: InvoiceStatus;
  version: number;
  date: string;
  lineItems: InvoiceLineItem[];
  attachmentName?: string;
  submittedBy: string;
  submittedByUid?: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComment?: string;
  exportedBy?: string;
  exportedAt?: string;
  exportReference?: string;
};

export type FinanceExportFormat = "json" | "csv";

export type FinanceExportRecord = {
  id: string;
  invoiceId: string;
  invoiceVersion: number;
  format: FinanceExportFormat;
  externalReference: string;
  fileName: string;
  createdAt: string;
  createdBy: string;
  status: "Generated";
};
export type Notice = { id: number; text: string; time: string; read: boolean };
export type Audit = { id: number; time: string; user: string; role: string; action: string; record: string };

export const roles: Role[] = ["GAP Administrator", "GAP Case Manager", "Veterinary Practice", "Finance Approver", "GRNSW Auditor"];

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
