/**
 * Team JAM contribution: JUBAYER ALAM
 * "Create emergency work order" modal fields.
 */
"use client";

export function WorkOrderForm({ practices, incidents }: { practices: string[][]; incidents: string[][] }) {
  return <div className="form-grid">
    <label>Incident reference<select name="incident" required><option value="">Select an emergency incident</option>{incidents.map(incident => <option value={incident[0]} key={incident[0]}>{incident[0]} — {incident[2]}</option>)}</select></label>
    <label>Priority<select name="priority"><option>Routine</option><option>Moderate</option><option>Urgent</option><option>Critical</option></select></label>
    <label className="full">Greyhounds <small>Separate names with commas</small><input name="dogs" required placeholder="Scout, Ruby" /></label>
    <label className="full">Requested service<select name="service"><option>Emergency consultation</option><option>Triage, imaging and stabilisation</option><option>Pathology and medication</option><option>Wound treatment</option><option>Surgery and hospitalisation</option></select></label>
    <label>Veterinary practice<select name="practice"><option value="">Save as unassigned draft</option>{practices.filter(practice => practice[3] === "Approved" && practice[4] === "Active").map(practice => <option key={practice[0]}>{practice[0]}</option>)}</select></label>
    <label>Response required<input name="due" type="datetime-local" /></label>
    <label>Authorised limit (AUD)<input name="limit" type="number" min="0" required defaultValue="1500" /></label>
    <label className="full">Instructions<textarea name="notes" rows={3} /></label>
  </div>;
}
