/**
 * Team JAM contribution: ARJUN SINGH.
 * Greyhound directory and status records.
 */
"use client";

import { useState } from "react";
import { Directory } from "../../shared/Directory";

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
  const [search, setSearch] = useState("");

  const searchText = search.trim().toLowerCase();

  const filteredRows = rows.filter((row) =>
    [row[0], row[1], row[2]].some((value) =>
      String(value).toLowerCase().includes(searchText),
    ),
  );

  return (
    <>
      <div style={{ marginBottom: "16px" }}>
        <label>
          Search Greyhounds
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by GAP reference, pet name or racing name"
            aria-label="Search Greyhounds"
            style={{ display: "block", width: "100%", marginTop: "6px" }}
          />
        </label>
      </div>

      {filteredRows.length > 0 ? (
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
          rows={filteredRows}
          action={!readOnly ? "Add greyhound" : undefined}
          onAction={() => setModal("greyhound")}
        />
      ) : (
        <p>No Greyhounds match your search.</p>
      )}
    </>
  );
}