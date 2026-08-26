/**
 * Team JAM contribution: ARJUN SINGH
 * "Add greyhound" modal fields.
 */
"use client";

export function GreyhoundForm() {
  return <div className="form-grid">
    <label>GAP reference<input name="ref" required /></label>
    <label>Microchip number<input name="microchip" /></label>
    <label>Pet name<input name="petName" required /></label>
    <label>Racing name<input name="racingName" /></label>
    <label className="full">Health alerts<textarea name="alerts" rows={3} /></label>
  </div>;
}
