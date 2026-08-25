"use client";

import { Directory } from "../../shared/Directory";

export function Incidents({ rows, readOnly, setModal }: { rows: string[][]; readOnly: boolean; setModal: (m: string) => void }) {
  return <Directory
    title="Emergency incidents"
    subtitle="Record, triage and coordinate greyhound welfare incidents"
    heads={["Reference", "Occurred", "Type", "Location", "Greyhounds", "Priority", "Status"]}
    rows={rows}
    action={!readOnly ? "Create incident" : undefined}
    onAction={() => setModal("incident")}
  />;
}
