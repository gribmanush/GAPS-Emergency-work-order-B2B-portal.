/**
 * Team JAM contribution: ARJUN SINGH
 * Greyhound directory and status records.
 */
"use client";

import { Directory } from "../../shared/Directory";
import { FosterPlacement } from "./FosterPlacement";

type GreyhoundsProps = {
  rows: string[][];
  readOnly: boolean;
  setModal: (modal: string) => void;
};

export function Greyhounds({
  rows,
  readOnly,
  setModal,
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

      <FosterPlacement rows={rows} />
    </>
  );
}