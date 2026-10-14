/**
 * Team JAM contribution target: JUBAYER ALAM
 * Jira: TJ-30 Emergency Work Order Form; TJ-34 Tax Invoice page.
 *
 * Evidence rule: Jubayer should review, explain, test and commit this file himself.
 */
export const JUBAYER_JIRA_ITEMS = ["TJ-30", "TJ-34"] as const;

// Parses the raw "Create work order" form into the fields the work-orders
// repository needs. The repository itself decides status/assignment, since
// those depend on which vet was picked and who's creating it.
export function parseWorkOrderFields(data: Record<string, FormDataEntryValue>) {
  const dogs = String(data.dogs || "New greyhound").split(",").map((name) => name.trim()).filter(Boolean);
  if (dogs.length === 0) throw new Error("Enter at least one greyhound name.");

  const due = String(data.due || "");
  if (due) {
    const dueDate = new Date(due);
    if (!Number.isNaN(dueDate.getTime()) && dueDate.getTime() < Date.now()) {
      throw new Error("Response required date/time can't be in the past.");
    }
  }

  return {
    incident: String(data.incident || "INC-2026-NEW"),
    dogs,
    priority: String(data.priority || "Moderate"),
    due: due || "Not set",
    limit: Number(data.limit || 0),
    service: String(data.service || "Emergency consultation"),
    notes: String(data.notes || ""),
  };
}

export function parseInvoiceFields(data: Record<string, FormDataEntryValue>) {
  return {
    workOrder: String(data.workOrder),
    practice: String(data.practice || "Unassigned"),
    amount: Number(data.amount),
  };
}
