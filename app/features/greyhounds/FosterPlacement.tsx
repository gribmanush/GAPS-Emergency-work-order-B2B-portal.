"use client";

import { useState } from "react";

type Props = {
  rows: string[][];
};

type Placement = {
  carerName: string;
  phone: string;
  email: string;
  startDate: string;
  status: string;
};

const placements: Record<string, Placement | null> = {
  "GAP-2918": {
    carerName: "Sarah Thompson",
    phone: "0412 345 678",
    email: "sarah.thompson@example.com",
    startDate: "12 August 2026",
    status: "Active",
  },
  "GAP-2921": {
    carerName: "Daniel Lee",
    phone: "0423 456 789",
    email: "daniel.lee@example.com",
    startDate: "18 August 2026",
    status: "Active",
  },
  "GAP-2927": null,
  "GAP-2884": {
    carerName: "Priya Sharma",
    phone: "0434 567 890",
    email: "priya.sharma@example.com",
    startDate: "2 July 2026",
    status: "Active",
  },
  "GAP-2851": {
    carerName: "Michael Brown",
    phone: "0445 678 901",
    email: "michael.brown@example.com",
    startDate: "21 June 2026",
    status: "Active",
  },
  "GAP-2852": null,
  "GAP-2806": {
    carerName: "Emma Wilson",
    phone: "0456 789 012",
    email: "emma.wilson@example.com",
    startDate: "9 May 2026",
    status: "Active",
  },
  "GAP-2789": null,
};

export function FosterPlacement({ rows }: Props) {
  const [selectedRef, setSelectedRef] = useState(rows[0]?.[0] ?? "");

  const greyhound = rows.find((row) => row[0] === selectedRef);
  const placement = placements[selectedRef];

  return (
    <section className="card">
      <h2>Foster carer placement</h2>
      <p>View the current foster carer assigned to a Greyhound.</p>

      <label>
        Select Greyhound
        <select
          value={selectedRef}
          onChange={(event) => setSelectedRef(event.target.value)}
        >
          {rows.map((row) => (
            <option key={row[0]} value={row[0]}>
              {row[0]} — {row[1]}
            </option>
          ))}
        </select>
      </label>

      <h3>{greyhound?.[1] ?? "Greyhound"}</h3>
      <p>
        <strong>GAP reference:</strong> {selectedRef}
      </p>

      {placement ? (
        <div>
          <p>
            <strong>Foster carer:</strong> {placement.carerName}
          </p>
          <p>
            <strong>Phone:</strong> {placement.phone}
          </p>
          <p>
            <strong>Email:</strong> {placement.email}
          </p>
          <p>
            <strong>Placement start date:</strong> {placement.startDate}
          </p>
          <p>
            <strong>Status:</strong> {placement.status}
          </p>
        </div>
      ) : (
        <p>
          <strong>No foster carer assigned.</strong>
        </p>
      )}
    </section>
  );
}