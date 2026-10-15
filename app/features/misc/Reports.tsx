"use client";

import { useMemo, useState } from "react";
import type { Timestamp } from "firebase/firestore";
import { PageHead } from "../../shared/PageHead";
import { Invoice, money, Practice, WorkOrder } from "../../shared/types";
import { downloadCsv } from "../../shared/csv";

// Records without a resolved createdAt yet (the brief window before the
// server assigns serverTimestamp()) are kept in view rather than dropped.
function inDateRange(createdAt: Timestamp | null | undefined, from: string, to: string): boolean {
  if (!createdAt) return true;
  const date = createdAt.toDate();
  if (from && date < new Date(`${from}T00:00:00`)) return false;
  if (to && date > new Date(`${to}T23:59:59.999`)) return false;
  return true;
}

// CSV export shouldn't dump a raw Firestore Timestamp object into a cell.
function forExport<T extends { createdAt?: Timestamp | null }>(rows: T[]) {
  return rows.map(({ createdAt, ...rest }) => ({ ...rest, createdAt: createdAt ? createdAt.toDate().toLocaleString("en-AU") : "" }));
}

export function Reports({ orders, invoices, practices }: { orders: WorkOrder[]; invoices: Invoice[]; practices: Practice[] }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filteredOrders = useMemo(() => orders.filter(o => inDateRange(o.createdAt, from, to)), [orders, from, to]);
  const filteredInvoices = useMemo(() => invoices.filter(i => inDateRange(i.createdAt, from, to)), [invoices, from, to]);

  const counts = useMemo(() => filteredOrders.reduce((a, o) => ({ ...a, [o.status]: (a[o.status] || 0) + 1 }), {} as Record<string, number>), [filteredOrders]);
  const practiceStats = useMemo(() => practices.map(p => {
    const assigned = filteredOrders.filter(o => o.practice === p.name);
    const completed = assigned.filter(o => o.status === "Closed").length;
    return { practice: p, assignedCount: assigned.length, completionRate: assigned.length ? Math.round((completed / assigned.length) * 100) : 0 };
  }), [filteredOrders, practices]);

  return <>
    <PageHead title="Operational reports" subtitle="Live analytics for welfare operations and finance" />
    <div className="toolbar">
      <div className="filter-tabs">
        <label>From <input type="date" value={from} max={to || undefined} onChange={e => setFrom(e.target.value)} /></label>
        <label>To <input type="date" value={to} min={from || undefined} onChange={e => setTo(e.target.value)} /></label>
        {(from || to) ? <button className="secondary" onClick={() => { setFrom(""); setTo(""); }}>Clear range</button> : null}
      </div>
      <div className="action-row">
        <button className="secondary" onClick={() => downloadCsv("work-orders-report.csv", forExport(filteredOrders))}>⇩ Export work orders CSV</button>
        <button className="secondary" onClick={() => downloadCsv("invoices-report.csv", forExport(filteredInvoices))}>⇩ Export invoices CSV</button>
      </div>
    </div>
    <div className="report-grid">
      <section className="panel">
        <h2>Work orders by status</h2>
        <div className="bar-chart">{Object.entries(counts).map(([k, v]) => <div key={k}><span>{k}</span><i><b style={{ width: `${v * 32}%` }} /></i><strong>{v}</strong></div>)}</div>
        {!Object.keys(counts).length ? <div className="empty"><b>No work orders in this range</b></div> : null}
      </section>
      <section className="panel">
        <h2>Invoice position</h2>
        <div className="big-number">{money(filteredInvoices.reduce((a, b) => a + b.amount, 0))}<span>Total invoice value</span></div>
        <div className="stat-row">
          <div><b>{filteredInvoices.filter(i => i.status === "Submitted").length}</b><span>Awaiting review</span></div>
          <div><b>{filteredInvoices.filter(i => i.status.includes("Approved")).length}</b><span>Approved</span></div>
          <div><b>{filteredInvoices.filter(i => i.status === "Rejected").length}</b><span>Rejected</span></div>
        </div>
      </section>
      <section className="panel report-wide">
        <h2>Practice response performance</h2>
        <table>
          <thead><tr><th>Practice</th><th>Assigned work</th><th>Avg. response</th><th>Completion rate</th></tr></thead>
          <tbody>{practiceStats.map(s => <tr key={s.practice.id}><td><b>{s.practice.name}</b></td><td>{s.assignedCount}</td><td>{s.practice.avgResponse}</td><td>{s.completionRate}%</td></tr>)}</tbody>
        </table>
        {!practiceStats.length ? <div className="empty"><b>No registered practices yet</b></div> : null}
      </section>
    </div>
  </>;
}
