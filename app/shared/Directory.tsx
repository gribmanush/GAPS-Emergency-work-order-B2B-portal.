"use client";

import { useState } from "react";
import { PageHead } from "./PageHead";
import { badge } from "./types";
import { downloadCsv } from "./csv";

const badgeValues = ["Critical","Urgent","Moderate","Approved","Pending","Active","Inactive","In care","Rehomed"];

export function Directory({ title, subtitle, heads, rows, action, onAction }: { title: string; subtitle: string; heads: string[]; rows: string[][]; action?: string; onAction?: () => void }) {
  const [q, setQ] = useState("");
  const filtered = rows.filter(r => r.join(" ").toLowerCase().includes(q.toLowerCase()));
  return <>
    <PageHead title={title} subtitle={subtitle} action={action} onAction={onAction} />
    <div className="toolbar">
      <div className="local-search">⌕ <input value={q} onChange={e => setQ(e.target.value)} placeholder={`Search ${title.toLowerCase()}…`} /></div>
      <button className="secondary" onClick={() => downloadCsv(`${title}.csv`, rows)}>⇩ Export CSV</button>
    </div>
    <div className="table-card">
      <table>
        <thead><tr>{heads.map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{filtered.map((r, i) => <tr key={i}>{r.map((v, j) => <td key={j}>{j === 0 ? <b>{v}</b> : (badgeValues.includes(v) ? <span className={badge(v)}>{v}</span> : v)}</td>)}</tr>)}</tbody>
      </table>
    </div>
  </>;
}
