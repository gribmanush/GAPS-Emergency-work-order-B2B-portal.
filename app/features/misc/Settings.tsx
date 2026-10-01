"use client";

import { useState } from "react";
import { PageHead } from "../../shared/PageHead";

export function Settings() {
  const [saved, setSaved] = useState(false);
  return <>
    <PageHead title="System settings" subtitle="Prototype defaults and operational controls" />
    <div className="settings-grid">
      <section className="panel">
        <h2>Operational defaults</h2>
        <label>Default currency<select><option>AUD — Australian Dollar</option></select></label>
        <label>Critical acknowledgement target<select><option>15 minutes</option><option>30 minutes</option></select></label>
        <label>Urgent acknowledgement target<select><option>30 minutes</option><option>60 minutes</option></select></label>
        <label>Financial warning threshold<input type="number" defaultValue="80" /><small>Percentage of authorised limit</small></label>
        <button className="primary" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}>{saved ? "✓ Settings saved" : "Save settings"}</button>
      </section>
    </div>
  </>;
}
