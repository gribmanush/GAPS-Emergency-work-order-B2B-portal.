"use client";

import { FormEvent, useState } from "react";
import { GenericForm } from "./GenericForm";
import { WorkOrderForm } from "../features/work-orders/WorkOrderForm";
import { InvoiceForm } from "../features/invoices/InvoiceForm";
import { GreyhoundForm } from "../features/greyhounds/GreyhoundForm";
import { PracticeForm } from "../features/misc/PracticeForm";
import { EmergencyIncidentForm } from "../features/misc/EmergencyIncidentForm";

const titles: Record<string, string> = {
  "work-order": "Create emergency work order",
  invoice: "Submit veterinary invoice",
  incident: "Create emergency incident",
  greyhound: "Add greyhound",
  practice: "Register veterinary practice",
};

export function Modal({ type, close, submit, formContext }: { type: string; close: () => void; submit: (d: Record<string, FormDataEntryValue>) => void; formContext: { practices: string[][]; incidents: string[][] } }) {
  const [error, setError] = useState("");
  function go(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    try { submit(Object.fromEntries(new FormData(e.currentTarget))); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "The record could not be saved."); }
  }
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) close(); }}>
    <div className="modal" role="dialog" aria-modal="true" aria-label={titles[type]}>
      <div className="modal-head">
        <div><p className="eyebrow">NEW RECORD</p><h2>{titles[type]}</h2></div>
        <button onClick={close} aria-label="Close">×</button>
      </div>
      <form onSubmit={go}>
        {type === "work-order" ? <WorkOrderForm practices={formContext.practices} incidents={formContext.incidents} /> : type === "invoice" ? <InvoiceForm /> : type === "greyhound" ? <GreyhoundForm /> : type === "practice" ? <PracticeForm /> : type === "incident" ? <EmergencyIncidentForm /> : <GenericForm type={type} />}
        {error ? <div className="form-note danger" role="alert">{error}</div> : null}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={close}>Cancel</button>
          <button className="primary">Save record</button>
        </div>
      </form>
    </div>
  </div>;
}
