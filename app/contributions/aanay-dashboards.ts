/**
 * Team JAM contribution target: AANAY VARTAK
 * Jira: TJ-28 GAP Admin Dashboard; TJ-29 Vet Dashboard.
 *
 * Evidence rule: Aanay should review, explain, test and commit this file himself.
 */
export const AANAY_JIRA_ITEMS = ["TJ-28", "TJ-29"] as const;

type OrderSummary = { status: string };
type InvoiceSummary = { status: string; amount: number };

export function buildDashboardMetrics(
  role: string,
  orders: OrderSummary[],
  invoices: InvoiceSummary[],
) {
  if (role === "Finance Approver") {
    return [
      ["Awaiting review", invoices.filter((item) => item.status === "Submitted").length, "invoices", null],
      ["Approved", invoices.filter((item) => item.status.includes("Approved")).length, "invoices", null],
      ["Rejected", invoices.filter((item) => item.status === "Rejected").length, "invoices", null],
      ["Submitted value", invoices.reduce((sum, item) => sum + item.amount, 0), "invoices", "currency"],
    ] as const;
  }

  const veterinaryView = role === "Veterinary Practice";
  return [
    [veterinaryView ? "New assignments" : "Open emergencies", orders.filter((item) => !["Closed", "Cancelled"].includes(item.status)).length, "work-orders", null],
    ["Awaiting acknowledgement", orders.filter((item) => item.status === "Awaiting Acknowledgement").length, "work-orders", null],
    ["Active treatments", orders.filter((item) => item.status === "In Progress").length, "work-orders", null],
    ["Needs action", orders.filter((item) => ["Declined", "Completed by Vet"].includes(item.status)).length, "work-orders", null],
  ] as const;
}
