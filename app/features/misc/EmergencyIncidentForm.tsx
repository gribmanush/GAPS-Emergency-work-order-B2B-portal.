"use client";

import type { Greyhound } from "../../shared/types";

export function EmergencyIncidentForm({ greyhounds }: { greyhounds: Greyhound[] }) {
  return <div className="form-grid">
    <label>Incident type<select name="type"><option>Medical emergency</option><option>Transport incident</option><option>Kennel injury</option></select></label>
    <label>Priority<select name="priority"><option>Moderate</option><option>Urgent</option><option>Critical</option></select></label>
    <label className="full">Occurred at<input name="occurredAt" type="datetime-local" required /></label>
    <fieldset className="full greyhound-picker">
      <legend>Affected greyhounds</legend>
      <small>Select every greyhound involved in this emergency case.</small>
      {greyhounds.length ? greyhounds.map(greyhound => <label key={greyhound.id} className="check">
        <input type="checkbox" name="greyhoundIds" value={greyhound.id} />
        {greyhound.petName} <span>({greyhound.id})</span>
      </label>) : <p>No greyhounds are currently registered.</p>}
    </fieldset>
    <label>Suburb<input name="suburb" required /></label>
    <label>Postcode<input name="postcode" inputMode="numeric" pattern="[0-9]{4}" required /></label>
    <label className="full">Summary<textarea name="summary" required rows={3} /></label>
    <label className="full">Reporter contact<input name="reporterContact" required placeholder="Phone number or email" /></label>
  </div>;
}
