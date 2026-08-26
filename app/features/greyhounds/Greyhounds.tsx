/**
 * Team JAM contribution: ARJUN SINGH
 * Greyhound directory and status records.
 */
"use client";

import { Directory } from "../../shared/Directory";

export function Greyhounds({ rows, readOnly, setModal }: { rows: string[][]; readOnly: boolean; setModal: (m: string) => void }) {
  return <Directory
    title="Greyhound directory"
    subtitle="Verified animal records used across emergency incidents"
    heads={["GAP reference", "Pet name", "Racing name", "Microchip", "Status", "Health alerts"]}
    rows={rows}
    action={!readOnly ? "Add greyhound" : undefined}
    onAction={() => setModal("greyhound")}
  />;
}
