/**
 * Team JAM contribution: ARJUN SINGH
 * Greyhound directory and status records.
 */
"use client";

import { Directory } from "../../shared/Directory";
import { MedicalRecords } from "./MedicalRecords";

type GreyhoundsProps = {
  rows: string[][];
  readOnly: boolean;
  setModal: (modal: string) => void;
  role: string;
  userName: string;
};

export function Greyhounds({
  rows,
  readOnly,
  setModal,
  role,
  userName,
}: GreyhoundsProps) {
  return (
    <>
      <Directory
        title="Greyhound directory"
        subtitle="Verified animal records used across emergency incidents"
        heads={[
          "GAP reference",
          "Pet name",
          "Racing name",
          "Microchip",
          "Status",
          "Health alerts",
        ]}
        rows={rows}
        action={!readOnly ? "Add greyhound" : undefined}
        onAction={() => setModal("greyhound")}
      />

      <MedicalRecords
        rows={rows}
        role={role}
        userName={userName}
      />
    </>
  );
}