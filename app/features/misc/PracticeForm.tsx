"use client";

export function PracticeForm() {
  return <div className="form-grid">
    <label>Legal business name<input name="legalName" required /></label>
    <label>Trading name<input name="tradingName" /></label>
    <label>ABN<input name="abn" inputMode="numeric" pattern="[0-9 ]{11,14}" required /></label>
    <label>Practice email<input name="email" type="email" required /></label>
    <label>Practice phone<input name="phone" type="tel" required /></label>
    <label>Emergency coverage<select name="coverage"><option>24-hour</option><option>Extended</option><option>Business hours</option></select></label>
    <label>Primary veterinary contact<input name="contactName" required /></label>
    <label>Veterinary registration number<input name="licenseNumber" required /></label>
    <label>Approval status<select name="approval"><option>Pending</option><option>Approved</option></select></label>
    <label>Operational status<select name="operations"><option>Inactive</option><option>Active</option></select></label>
    <label className="full">Supplier reference<small>Use “Not mapped” until GAP finance confirms the supplier record.</small><input name="supplierReference" defaultValue="Not mapped" /></label>
    <div className="full form-note">Only practices marked Approved and Active become available for new work-order assignment.</div>
  </div>;
}
