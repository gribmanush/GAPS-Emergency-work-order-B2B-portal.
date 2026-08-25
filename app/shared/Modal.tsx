"use client";

import { FormEvent } from "react";
import { GenericForm } from "./GenericForm";
import { WorkOrderForm } from "../features/work-orders/WorkOrderForm";
import { InvoiceForm } from "../features/invoices/InvoiceForm";
import { GreyhoundForm } from "../features/greyhounds/GreyhoundForm";

const titles: Record<string, string> = {
  "work-order": "Create emergency work order",
  invoice: "Submit veterinary invoice",
  incident: "Create emergency incident",
  greyhound: "Add greyhound",
  practice: "Register veterinary practice",
};

export function Modal({ type, close, submit }: { type: string; close: () => void; submit: (d: Record<string, FormDataEntryValue>) => void }) {
  function go(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submit(Object.fromEntries(new FormData(e.currentTarget)));
  }
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) close(); }}>
    <div className="modal" role="dialog" aria-modal="true" aria-label={titles[type]}>
      <div className="modal-head">
        <div><p className="eyebrow">NEW RECORD</p><h2>{titles[type]}</h2></div>
        <button onClick={close} aria-label="Close">×</button>
      </div>
      <form onSubmit={go}>
        {type === "work-order" ? <WorkOrderForm /> : type === "invoice" ? <InvoiceForm /> : type === "greyhound" ? <GreyhoundForm /> : <GenericForm type={type} />}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={close}>Cancel</button>
          <button className="primary">Save record</button>
        </div>
      </form>
    </div>
  </div>;
}
