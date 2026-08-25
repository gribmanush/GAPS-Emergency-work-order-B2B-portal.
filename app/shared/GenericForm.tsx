"use client";

export function GenericForm({ type }: { type: string }) {
  if (type === "incident") return <div className="form-grid">
    <label>Incident type<select name="type"><option>Medical emergency</option><option>Transport incident</option><option>Kennel injury</option></select></label>
    <label>Priority<select name="priority"><option>Moderate</option><option>Urgent</option><option>Critical</option></select></label>
    <label className="full">Summary<textarea name="summary" required rows={3} /></label>
    <label>Suburb<input name="suburb" required /></label>
    <label>Postcode<input name="postcode" pattern="[0-9]{4}" required /></label>
  </div>;
  return <div className="form-grid">
    <label>Legal name<input name="legalName" required /></label>
    <label>Trading name<input name="tradingName" /></label>
    <label>ABN<input name="abn" pattern="[0-9 ]{11,14}" required /></label>
    <label>Email<input name="email" type="email" required /></label>
    <label>Phone<input name="phone" required /></label>
    <label>Emergency coverage<select name="coverage"><option>24-hour</option><option>Extended hours</option><option>Business hours</option></select></label>
  </div>;
}
