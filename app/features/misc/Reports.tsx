"use client";

import { useMemo } from "react";
import { PageHead } from "../../shared/PageHead";
import { Invoice, money, WorkOrder } from "../../shared/types";
import { seedPractices } from "../../shared/seed-data";

export function Reports({ orders, invoices }: { orders: WorkOrder[]; invoices: Invoice[] }) {
  const counts = useMemo(() => orders.reduce((a, o) => ({ ...a, [o.status]: (a[o.status] || 0) + 1 }), {} as Record<string, number>), [orders]);
  return <>
    <PageHead title="Operational reports" subtitle="Synthetic demonstration analytics for welfare operations and finance" />
    <div className="report-grid">
      <section className="panel">
        <h2>Work orders by status</h2>
        <div className="bar-chart">{Object.entries(counts).map(([k, v]) => <div key={k}><span>{k}</span><i><b style={{ width: `${v * 32}%` }} /></i><strong>{v}</strong></div>)}</div>
      </section>
      <section className="panel">
        <h2>Invoice position</h2>
        <div className="big-number">{money(invoices.reduce((a, b) => a + b.amount, 0))}<span>Total demonstrated invoice value</span></div>
        <div className="stat-row">
          <div><b>{invoices.filter(i => i.status === "Submitted").length}</b><span>Awaiting review</span></div>
          <div><b>{invoices.filter(i => i.status.includes("Approved")).length}</b><span>Approved</span></div>
          <div><b>{invoices.filter(i => i.status === "Rejected").length}</b><span>Rejected</span></div>
        </div>
      </section>
      <section className="panel report-wide">
        <h2>Practice response performance</h2>
        <table>
          <thead><tr><th>Practice</th><th>Assigned work</th><th>Avg. acknowledgement</th><th>Completion rate</th></tr></thead>
          <tbody>{seedPractices.slice(0, 4).map((p, i) => <tr key={p[0]}><td><b>{p[0]}</b></td><td>{5 - i}</td><td>{p[5]}</td><td>{92 - i * 4}%</td></tr>)}</tbody>
        </table>
      </section>
    </div>
  </>;
}
