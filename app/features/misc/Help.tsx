"use client";

import { PageHead } from "../../shared/PageHead";

const faqs = [
  ["How do I create a work order?", "Open Work Orders, select Create work order, add incident, greyhounds, services, practice and financial authority, then review before assignment."],
  ["How does a practice acknowledge work?", "Veterinary users open a newly assigned work order and select Acknowledge. They can only access work assigned to their own practice."],
  ["How do I submit an invoice?", "After completing veterinary work, open the Invoice tab or Invoices page, enter line items and supporting evidence, then submit for finance review."],
  ["What happens after invoice approval?", "A GAP finance user can generate an audited Coupa-ready JSON or CSV output. The client is not providing an API, so the portal does not claim a live Coupa integration."],
];

export function Help({ setToast }: { setToast: (s: string) => void }) {
  return <>
    <PageHead title="Help & support" subtitle="Quick guidance for GAP staff, veterinary practices and finance reviewers" />
    <div className="help-grid">
      <section className="panel">
        <h2>Frequently asked questions</h2>
        {faqs.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
      </section>
      <section className="panel">
        <h2>Contact support</h2>
        <form onSubmit={e => { e.preventDefault(); (e.target as HTMLFormElement).reset(); setToast(`Support request SUP-${Date.now().toString().slice(-5)} created`); }}>
          <label>Topic<select required><option>Access issue</option><option>Work order</option><option>Invoice</option><option>Technical problem</option></select></label>
          <label>Details<textarea required rows={5} placeholder="Describe what happened and include the record reference…" /></label>
          <button className="primary">Submit support request</button>
        </form>
      </section>
    </div>
  </>;
}
