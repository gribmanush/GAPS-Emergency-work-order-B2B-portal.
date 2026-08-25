"use client";

import { useState } from "react";
import { PageHead } from "../../shared/PageHead";
import { Audit } from "../../shared/types";
import { downloadCsv } from "../../shared/csv";

export function AuditLog({ rows }: { rows: Audit[] }) {
  const [q, setQ] = useState("");
  const data = rows.filter(r => JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));
  return <>
    <PageHead title="Audit log" subtitle="Append-only traceability across emergency, veterinary and finance actions" />
    <div className="toolbar">
      <div className="local-search">⌕ <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search user, action or record…" /></div>
      <button className="secondary" onClick={() => downloadCsv("audit-log.csv", data)}>⇩ Export CSV</button>
    </div>
    <div className="table-card">
      <table>
        <thead><tr><th>Timestamp</th><th>User</th><th>Role</th><th>Action</th><th>Record</th></tr></thead>
        <tbody>{data.map(r => <tr key={r.id}><td>{r.time}</td><td><b>{r.user}</b></td><td>{r.role}</td><td>{r.action}</td><td><span className="record-ref">{r.record}</span></td></tr>)}</tbody>
      </table>
    </div>
  </>;
}
