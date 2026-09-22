/**
 * Team JAM contribution: AANAY VARTAK
 * Jira: TJ-28 GAP Admin Dashboard; TJ-29 Vet Dashboard.
 */
import type { Invoice, Role, WorkOrder } from "../shared/types";

export const AANAY_JIRA_ITEMS = ["TJ-28", "TJ-29"] as const;

export type DashboardMetric = readonly [
  label: string,
  value: number,
  target: "work-orders" | "invoices",
  format: "currency" | null,
];

export function filterDashboardOrders(role: Role, orders: WorkOrder[], practiceName?: string) {
  if (role !== "Veterinary Practice") return orders;
  if (!practiceName?.trim()) return [];
  return orders.filter(order => order.practice === practiceName);
}

export function filterDashboardInvoices(role: Role, invoices: Invoice[], practiceName?: string) {
  if (role !== "Veterinary Practice") return invoices;
  if (!practiceName?.trim()) return [];
  return invoices.filter(invoice => invoice.practice === practiceName);
}

export function buildDashboardMetrics(
  role: Role,
  orders: WorkOrder[],
  invoices: Invoice[],
  practiceName?: string,
): DashboardMetric[] {
  const visibleOrders = filterDashboardOrders(role, orders, practiceName);
  const visibleInvoices = filterDashboardInvoices(role, invoices, practiceName);

  if (role === "Finance Approver") {
    return [
      ["Awaiting review", visibleInvoices.filter(item => ["Submitted", "Under Review"].includes(item.status)).length, "invoices", null],
      ["Ready for export", visibleInvoices.filter(item => item.status === "Approved — Ready for export").length, "invoices", null],
      ["Exported", visibleInvoices.filter(item => item.status === "Exported").length, "invoices", null],
      ["Open invoice value", visibleInvoices.filter(item => !["Rejected", "Exported"].includes(item.status)).reduce((sum, item) => sum + item.amount, 0), "invoices", "currency"],
    ];
  }

  if (role === "Veterinary Practice") {
    const invoicedWorkOrders = new Set(
      visibleInvoices.filter(invoice => invoice.status !== "Rejected").map(invoice => invoice.workOrder),
    );
    return [
      ["New assignments", visibleOrders.filter(item => item.status === "Awaiting Acknowledgement").length, "work-orders", null],
      ["In treatment", visibleOrders.filter(item => item.status === "In Progress").length, "work-orders", null],
      ["Ready to invoice", visibleOrders.filter(item => item.status === "Completed by Vet" && !invoicedWorkOrders.has(item.id)).length, "invoices", null],
      ["Invoices in review", visibleInvoices.filter(item => ["Submitted", "Under Review"].includes(item.status)).length, "invoices", null],
    ];
  }

  return [
    ["Open emergencies", visibleOrders.filter(item => !["Closed", "Cancelled", "Draft"].includes(item.status)).length, "work-orders", null],
    ["Awaiting acknowledgement", visibleOrders.filter(item => item.status === "Awaiting Acknowledgement").length, "work-orders", null],
    ["Active treatments", visibleOrders.filter(item => item.status === "In Progress").length, "work-orders", null],
    ["Needs GAP action", visibleOrders.filter(item => ["Declined", "Completed by Vet"].includes(item.status)).length, "work-orders", null],
  ];
}

export function buildStatusDistribution(orders: WorkOrder[]) {
  return {
    open: orders.filter(item => !["Closed", "Cancelled", "Draft"].includes(item.status)).length,
    active: orders.filter(item => item.status === "In Progress").length,
    awaiting: orders.filter(item => item.status === "Awaiting Acknowledgement").length,
    actionNeeded: orders.filter(item => ["Declined", "Completed by Vet"].includes(item.status)).length,
  };
}
