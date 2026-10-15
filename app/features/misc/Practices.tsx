"use client";

import { useState } from "react";
import { PageHead } from "../../shared/PageHead";
import { downloadCsv } from "../../shared/csv";
import { badge, Practice, practiceToRow, Role } from "../../shared/types";

const heads = ["Practice", "Approval", "Operations", "Coverage", "Supplier reference", "Avg. response", "ABN", "Contact"];

export function Practices({ practices, role, setModal, onApprove }: { practices: Practice[]; role: Role; setModal: (m: string) => void; onApprove: (id: string) => void }) {
  const [q, setQ] = useState("");
  const filtered = practices.filter(p => practiceToRow(p).join(" ").toLowerCase().includes(q.toLowerCase()));
  const isAdmin = role === "GAP Administrator";
  return <>
    <PageHead title="Veterinary practices" subtitle="Approved emergency veterinary network" action={isAdmin ? "Register practice" : undefined} onAction={() => setModal("practice")} />
    <div className="toolbar">
      <div className="local-search">⌕ <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search veterinary practices…" /></div>
      <button className="secondary" onClick={() => downloadCsv("Veterinary practices.csv", practices.map(practiceToRow))}>⇩ Export CSV</button>
    </div>
    <div className="table-card">
      <table>
        <thead><tr>{heads.map(h => <th key={h}>{h}</th>)}{isAdmin ? <th>Actions</th> : null}</tr></thead>
        <tbody>{filtered.map(p => {
          const pending = p.approval !== "Approved" || p.operations !== "Active";
          return <tr key={p.id}>
            <td><b>{p.name}</b></td>
            <td><span className={badge(p.approval)}>{p.approval}</span></td>
            <td><span className={badge(p.operations)}>{p.operations}</span></td>
            <td>{p.coverage}</td>
            <td>{p.supplierRef}</td>
            <td>{p.avgResponse}</td>
            <td>{p.abn || "—"}</td>
            <td>{[p.email, p.phone].filter(Boolean).join(" · ") || "—"}</td>
            {isAdmin ? <td>{pending ? <button onClick={() => onApprove(p.id)}>Approve &amp; activate</button> : <span className="table-link">Approved</span>}</td> : null}
          </tr>;
        })}</tbody>
      </table>
      {!filtered.length ? <div className="empty"><b>No practices yet</b><span>Registered practices will appear here.</span></div> : null}
    </div>
  </>;
}
