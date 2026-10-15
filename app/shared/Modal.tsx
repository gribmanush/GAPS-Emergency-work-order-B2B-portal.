"use client";

import { FormEvent } from "react";
import { GenericForm } from "./GenericForm";
import { WorkOrderForm } from "../features/work-orders/WorkOrderForm";
import { InvoiceForm } from "../features/invoices/InvoiceForm";
import { GreyhoundForm } from "../features/greyhounds/GreyhoundForm";
import { EmergencyIncidentForm } from "../features/misc/EmergencyIncidentForm";
import type { Greyhound, Invoice, WorkOrder } from "./types";
import type { VetDirectoryEntry } from "../lib/vet-directory";

const titles: Record<string, string> = {
  "work-order": "Create emergency work order",
  invoice: "Submit veterinary invoice",
  incident: "Create emergency incident",
  greyhound: "Add greyhound",
  practice: "Register veterinary practice",
};

export function Modal({ type, close, submit, invoiceContext, vets, greyhounds }: { type: string; close: () => void; submit: (d: Record<string, FormDataEntryValue>) => void; invoiceContext?: { orders: WorkOrder[]; invoices: Invoice[]; practice?: string }; vets?: VetDirectoryEntry[]; greyhounds?: Greyhound[] }) {
  function go(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData);
    if (type === "incident") values.greyhoundIds = formData.getAll("greyhoundIds").join(",");
    submit(values);
  }
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) close(); }}>
    <div className="modal" role="dialog" aria-modal="true" aria-label={titles[type]}>
      <div className="modal-head">
        <div><p className="eyebrow">NEW RECORD</p><h2>{titles[type]}</h2></div>
        <button onClick={close} aria-label="Close">×</button>
      </div>
      <form onSubmit={go}>
        {type === "work-order" ? <WorkOrderForm vets={vets || []} /> : type === "invoice" && invoiceContext ? <InvoiceForm {...invoiceContext} /> : type === "greyhound" ? <GreyhoundForm /> : type === "incident" ? <EmergencyIncidentForm greyhounds={greyhounds || []} /> : <GenericForm />}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={close}>Cancel</button>
          <button className="primary">Save record</button>
        </div>
      </form>
    </div>
  </div>;
}
