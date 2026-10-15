"use client";

import { ChangeEvent } from "react";
import { isValidAbn } from "./validators";

function validateAbnField(e: ChangeEvent<HTMLInputElement>) {
  const valid = e.target.value.trim() === "" || isValidAbn(e.target.value);
  e.target.setCustomValidity(valid ? "" : "Enter a valid 11-digit ABN (fails the ATO modulus-89 check).");
}

export function GenericForm() {
  return <div className="form-grid">
    <label>Legal name<input name="legalName" required /></label>
    <label>Trading name<input name="tradingName" /></label>
    <label>ABN<input name="abn" required onChange={validateAbnField} onBlur={validateAbnField} placeholder="11 digit ABN" /></label>
    <label>Email<input name="email" type="email" required /></label>
    <label>Phone<input name="phone" type="tel" pattern="[0-9 +\-()]{6,20}" title="Digits, spaces, +, -, ( and ) only" required /></label>
    <label>Emergency coverage<select name="coverage"><option>24-hour</option><option>Extended hours</option><option>Business hours</option></select></label>
  </div>;
}
