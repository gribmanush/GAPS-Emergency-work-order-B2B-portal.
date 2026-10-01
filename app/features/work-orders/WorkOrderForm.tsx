/**
 * Team JAM contribution: JUBAYER ALAM
 * "Create emergency work order" modal fields.
 */
"use client";

import type { VetDirectoryEntry } from "../../lib/vet-directory";

export function WorkOrderForm({ vets }: { vets: VetDirectoryEntry[] }) {
  return <div className="form-grid">
    <label>Incident reference<input name="incident" required defaultValue="INC-2026-090" /></label>
    <label>Priority<select name="priority"><option>Routine</option><option>Moderate</option><option>Urgent</option><option>Critical</option></select></label>
    <label className="full">Greyhounds <small>Separate names with commas</small><input name="dogs" required placeholder="Scout, Ruby" /></label>
    <label className="full">Requested service<select name="service"><option>Emergency consultation</option><option>Triage, imaging and stabilisation</option><option>Pathology and medication</option><option>Wound treatment</option><option>Surgery and hospitalisation</option></select></label>
    <label className="full">Assign to vet<small>The assigned vet will be notified and must accept or reject the work.</small>
      <select name="assignedVetUid" required disabled={!vets.length}>
        <option value="">{vets.length ? "Select a registered vet" : "No registered vets available yet"}</option>
        {vets.map(v => <option key={v.uid} value={v.uid}>{v.fullName}{v.practice ? ` — ${v.practice}` : ""}</option>)}
      </select>
    </label>
    <label>Response required<input name="due" type="datetime-local" /></label>
    <label>Authorised limit (AUD)<input name="limit" type="number" min="0" required defaultValue="1500" /></label>
    <label className="full">Instructions<textarea name="notes" rows={3} /></label>
  </div>;
}
