/**
 * PLACEHOLDER — pending Anay's PR (TJ-28, TJ-29).
 * Not currently used by the placeholder Dashboard component; kept as a stub
 * so the file exists ready for his real implementation.
 */
type OrderSummary = { status: string };
type InvoiceSummary = { status: string; amount: number };

export function buildDashboardMetrics(
  role: string,
  orders: OrderSummary[],
  invoices: InvoiceSummary[],
) {
  return [] as const;
}
