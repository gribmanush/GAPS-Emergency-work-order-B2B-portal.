/**
 * Team JAM contribution: AANAY VARTAK
 * GAP Administrator / Case Manager / Vet dashboard overview.
 */
"use client";

import { PageHead } from "../../shared/PageHead";
import { badge, Invoice, money, Role, WorkOrder } from "../../shared/types";
import { buildDashboardMetrics } from "../../contributions/aanay-dashboards";

export function Dashboard({ role, orders, invoices, setRoute, setModal }: { role: Role; orders: WorkOrder[]; invoices: Invoice[]; setRoute: (r: string) => void; setModal: (m: string) => void }) {
  const cards = buildDashboardMetrics(role, orders, invoices).map(([label, value, target, format]) => [label, format === "currency" ? money(Number(value)) : value, target]);
  return <>
    <PageHead eyebrow="OPERATIONS OVERVIEW" title={`Good morning, ${role.split(" ")[0]}`} subtitle="Here is the current emergency-care position across the network." action={!(["Veterinary Practice", "GRNSW Auditor"] as Role[]).includes(role) ? "Create work order" : undefined} onAction={() => setModal("work-order")} />
    <div className="notice-banner"><b>Coupa deferred for this build</b><span>Approved invoices are held securely at “Coupa pending” until the integration is enabled.</span></div>
    <div className="metric-grid">{cards.map(([label, value, target], i) => <button className="metric" key={String(label)} onClick={() => setRoute(String(target))}><span className={`metric-icon m${i}`}>{["↗", "◷", "✚", "!"][i]}</span><small>{label}</small><strong>{value}</strong><em>View details →</em></button>)}</div>
    <div className="dash-grid">
      <section className="panel wide">
        <div className="panel-head"><div><h2>Priority work</h2><p>Cases requiring attention today</p></div><button onClick={() => setRoute("work-orders")}>View all</button></div>
        <div className="work-cards">{orders.filter(o => o.status !== "Closed").slice(0, 4).map(o => <button key={o.id} onClick={() => setRoute("work-orders")}><div><b>{o.id}</b><span className={badge(o.priority)}>{o.priority}</span></div><h3>{o.dogs.join(", ")}</h3><p>{o.practice}</p><div><span className={badge(o.status)}>{o.status}</span><small>{o.due}</small></div></button>)}</div>
      </section>
      <section className="panel">
        <div className="panel-head"><div><h2>Status distribution</h2><p>Open work orders</p></div></div>
        <div className="donut-wrap">
          <div className="donut"><b>{orders.filter(o => o.status !== "Closed").length}</b><span>open</span></div>
          <ul>
            <li><i className="c1" /> In treatment <b>{orders.filter(o => o.status === "Treatment in Progress").length}</b></li>
            <li><i className="c2" /> Awaiting acceptance <b>{orders.filter(o => o.status === "Work Order Created and Assigned").length}</b></li>
            <li><i className="c3" /> Needs GAP review <b>{orders.filter(o => o.status === "Veterinary Work Completed" || o.status === "GAP Review").length}</b></li>
          </ul>
        </div>
      </section>
    </div>
  </>;
}
