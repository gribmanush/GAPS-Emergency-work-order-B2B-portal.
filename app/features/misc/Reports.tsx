"use client";

import { useMemo } from "react";
import { PageHead } from "../../shared/PageHead";
import { Invoice, money, Practice, WorkOrder } from "../../shared/types";

export function Reports({ orders, invoices, practices }: { orders: WorkOrder[]; invoices: Invoice[]; practices: Practice[] }) {
  const counts = useMemo(() => orders.reduce((a, o) => ({ ...a, [o.status]: (a[o.status] || 0) + 1 }), {} as Record<string, number>), [orders]);
  const practiceStats = useMemo(() => practices.map(p => {
    const assigned = orders.filter(o => o.practice === p.name);
    const completed = assigned.filter(o => o.status === "Closed").length;
    return { practice: p, assignedCount: assigned.length, completionRate: assigned.length ? Math.round((completed / assigned.length) * 100) : 0 };
  }), [orders, practices]);

  return <>
    <PageHead title="Operational reports" subtitle="Live analytics for welfare operations and finance" />
    <div className="report-grid">
      <section className="panel">
        <h2>Work orders by status</h2>
        <div className="bar-chart">{Object.entries(counts).map(([k, v]) => <div key={k}><span>{k}</span><i><b style={{ width: `${v * 32}%` }} /></i><strong>{v}</strong></div>)}</div>
        {!Object.keys(counts).length ? <div className="empty"><b>No work orders yet</b></div> : null}
      </section>
      <section className="panel">
        <h2>Invoice position</h2>
        <div className="big-number">{money(invoices.reduce((a, b) => a + b.amount, 0))}<span>Total invoice value</span></div>
        <div className="stat-row">
          <div><b>{invoices.filter(i => i.status === "Submitted").length}</b><span>Awaiting review</span></div>
          <div><b>{invoices.filter(i => i.status.includes("Approved")).length}</b><span>Approved</span></div>
          <div><b>{invoices.filter(i => i.status === "Rejected").length}</b><span>Rejected</span></div>
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
