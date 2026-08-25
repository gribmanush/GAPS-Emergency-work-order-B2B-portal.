/**
 * Team JAM contribution: JUBAYER ALAM
 * "Create emergency work order" modal fields.
 */
"use client";

import { seedPractices } from "../../shared/seed-data";

export function WorkOrderForm() {
  const practices = seedPractices;
  return <div className="form-grid">
    <label>Incident reference<input name="incident" required defaultValue="INC-2026-090" /></label>
    <label>Priority<select name="priority"><option>Routine</option><option>Moderate</option><option>Urgent</option><option>Critical</option></select></label>
    <label className="full">Greyhounds <small>Separate names with commas</small><input name="dogs" required placeholder="Scout, Ruby" /></label>
    <label className="full">Requested service<select name="service"><option>Emergency consultation</option><option>Triage, imaging and stabilisation</option><option>Pathology and medication</option><option>Wound treatment</option><option>Surgery and hospitalisation</option></select></label>
    <label>Veterinary practice<select name="practice"><option value="">Save as unassigned draft</option>{practices.filter(p => p[1] === "Approved" && p[2] === "Active").map(p => <option key={p[0]}>{p[0]}</option>)}</select></label>
    <label>Response required<input name="due" type="datetime-local" /></label>
    <label>Authorised limit (AUD)<input name="limit" type="number" min="0" required defaultValue="1500" /></label>
    <label className="full">Instructions<textarea name="notes" rows={3} /></label>
  </div>;
}
