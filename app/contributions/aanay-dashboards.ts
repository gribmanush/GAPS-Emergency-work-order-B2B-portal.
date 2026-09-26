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
    [veterinaryView ? "New assignments" : "Open emergencies", orders.filter((item) => item.status !== "Closed").length, "work-orders", null],
    ["Awaiting acceptance", orders.filter((item) => item.status === "Work Order Created and Assigned").length, "work-orders", null],
    ["Active treatments", orders.filter((item) => item.status === "Treatment in Progress").length, "work-orders", null],
    ["Needs GAP review", orders.filter((item) => item.status === "Veterinary Work Completed" || item.status === "GAP Review").length, "work-orders", null],
  ] as const;
}
