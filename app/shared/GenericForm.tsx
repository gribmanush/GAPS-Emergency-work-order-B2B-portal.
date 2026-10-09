"use client";

export function GenericForm() {
  return <div className="form-grid">
    <label>Legal name<input name="legalName" required /></label>
    <label>Trading name<input name="tradingName" /></label>
    <label>ABN<input name="abn" pattern="[0-9 ]{11,14}" required /></label>
    <label>Email<input name="email" type="email" required /></label>
    <label>Phone<input name="phone" required /></label>
    <label>Emergency coverage<select name="coverage"><option>24-hour</option><option>Extended hours</option><option>Business hours</option></select></label>
  </div>;
}
