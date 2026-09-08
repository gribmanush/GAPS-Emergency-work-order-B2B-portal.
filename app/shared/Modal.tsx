"use client";

import { FormEvent, useState } from "react";
import { GenericForm } from "./GenericForm";
import { WorkOrderForm } from "../features/work-orders/WorkOrderForm";
import { InvoiceForm } from "../features/invoices/InvoiceForm";
import { GreyhoundForm } from "../features/greyhounds/GreyhoundForm";
import type { Invoice, WorkOrder } from "./types";

const titles: Record<string, string> = {
  "work-order": "Create emergency work order",
  invoice: "Submit veterinary invoice",
  incident: "Create emergency incident",
  greyhound: "Add greyhound",
  practice: "Register veterinary practice",
};

export function Modal({ type, close, submit, invoiceContext }: { type: string; close: () => void; submit: (d: Record<string, FormDataEntryValue>) => void | Promise<void>; invoiceContext?: { orders: WorkOrder[]; invoices: Invoice[]; practice: string } }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function go(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await submit(Object.fromEntries(new FormData(e.currentTarget)));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The record could not be saved.");
    } finally {
      setSaving(false);
    }
  }
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) close(); }}>
    <div className="modal" role="dialog" aria-modal="true" aria-label={titles[type]}>
      <div className="modal-head">
        <div><p className="eyebrow">NEW RECORD</p><h2>{titles[type]}</h2></div>
        <button onClick={close} aria-label="Close">×</button>
      </div>
      <form onSubmit={go}>
        {type === "work-order" ? <WorkOrderForm /> : type === "invoice" && invoiceContext ? <InvoiceForm {...invoiceContext} /> : type === "greyhound" ? <GreyhoundForm /> : <GenericForm type={type} />}
        {error ? <div className="validation-message" role="alert">{error}</div> : null}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={close} disabled={saving}>Cancel</button>
          <button className="primary" disabled={saving}>{saving ? "Saving…" : "Save record"}</button>
        </div>
      </form>
    </div>
  </div>;
}
