"use client";

import { useState } from "react";

export function EmergencyIncidentForm() {
  const [now] = useState(() => {
    const current = new Date();
    return new Date(current.getTime() - current.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  return <div className="form-grid">
    <label>Incident type<select name="type"><option>Medical emergency</option><option>Transport incident</option><option>Kennel injury</option><option>Suspected ingestion</option><option>Other welfare incident</option></select></label>
    <label>Priority<select name="priority"><option>Moderate</option><option>Urgent</option><option>Critical</option></select></label>
    <label>Occurred at<input name="occurredAt" type="datetime-local" defaultValue={now} required /></label>
    <label>Affected greyhounds<input name="greyhoundCount" type="number" min="1" step="1" defaultValue="1" required /></label>
    <label>Suburb<input name="suburb" required /></label>
    <label>Postcode<input name="postcode" inputMode="numeric" pattern="[0-9]{4}" required /></label>
    <label className="full">Emergency summary<textarea name="summary" required rows={3} placeholder="Describe what happened and the immediate welfare concern." /></label>
    <label className="full">Reporter/contact details<input name="reporter" required placeholder="Name and contact number" /></label>
    <div className="full form-note">The incident is created as a Draft. GAP staff can then create and assign an emergency work order.</div>
  </div>;
}
