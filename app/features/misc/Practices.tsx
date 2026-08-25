"use client";

import { Directory } from "../../shared/Directory";
import { Role } from "../../shared/types";

export function Practices({ rows, role, setModal }: { rows: string[][]; role: Role; setModal: (m: string) => void }) {
  return <Directory
    title="Veterinary practices"
    subtitle="Approved emergency veterinary network"
    heads={["Practice", "Approval", "Operations", "Coverage", "Supplier reference", "Avg. response"]}
    rows={rows}
    action={role === "GAP Administrator" ? "Register practice" : undefined}
    onAction={() => setModal("practice")}
  />;
}
