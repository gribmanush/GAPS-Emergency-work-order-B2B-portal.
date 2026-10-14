/**
 * Team JAM contribution: JUBAYER ALAM
 * "Submit veterinary invoice" modal fields (tax invoice capture).
 */
"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { Invoice, isWorkOrderStageAtLeast, WorkOrder } from "../../shared/types";

// Kept comfortably under Firestore's 1MiB document limit once base64-encoded (~4/3 inflation).
const MAX_FILE_SIZE = 700 * 1024;
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export function InvoiceForm({ orders, invoices, practice }: { orders: WorkOrder[]; invoices: Invoice[]; practice?: string }) {
  const [fileName, setFileName] = useState("");
  const [fileData, setFileData] = useState("");
  const [fileError, setFileError] = useState("");

  const eligibleOrders = useMemo(() => orders.filter(order => {
    const correctPractice = practice ? order.practice === practice : true;
    const completed = isWorkOrderStageAtLeast(order.status, "Veterinary Work Completed");
    const alreadyInvoiced = invoices.some(invoice => invoice.workOrder === order.id && invoice.status !== "Rejected");
    return correctPractice && completed && !alreadyInvoiced;
  }), [orders, invoices, practice]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFileError("");
    setFileName("");
    setFileData("");
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError("Only PDF, JPG and PNG files are allowed.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError("The file must be 700 KB or smaller.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFileName(file.name);
      setFileData(String(reader.result));
    };
    reader.onerror = () => {
      setFileError("The file could not be read.");
      event.target.value = "";
    };
    reader.readAsDataURL(file);
  }

  return <div className="form-grid">
    <input type="hidden" name="practice" value={practice || "Unassigned"} />
    <input type="hidden" name="fileName" value={fileName} />
    <input type="hidden" name="fileData" value={fileData} />
    <label>Work order<select name="workOrder" required disabled={!eligibleOrders.length}><option value="">Select a work order</option>{eligibleOrders.map(order => <option key={order.id} value={order.id}>{order.id} — {order.dogs.join(", ")}</option>)}</select></label>
    <label>Invoice total (AUD)<input name="amount" type="number" min="0" step="0.01" required /></label>
    <label className="full">Supporting invoice<input name="file" type="file" accept=".pdf,.png,.jpg,.jpeg" required onChange={handleFileChange} /></label>
    {fileError ? <div className="full validation-message">{fileError}</div> : null}
    {!eligibleOrders.length ? <div className="full validation-message">No completed, uninvoiced work orders are available{practice ? ` for ${practice}` : ""}.</div> : null}
    <div className="full form-note">Submission creates an auditable invoice for GAP finance review. No data is sent to Coupa.</div>
  </div>;
}
