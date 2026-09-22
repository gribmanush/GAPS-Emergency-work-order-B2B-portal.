/**
 * Team JAM contribution: AANAY VARTAK
 * Jira: TJ-28 GAP Admin Dashboard; TJ-29 Vet Dashboard.
 */
"use client";

import { PageHead } from "../../shared/PageHead";
import { badge, Invoice, money, Role, WorkOrder } from "../../shared/types";
import { buildDashboardMetrics, buildStatusDistribution, filterDashboardOrders } from "../../contributions/aanay-dashboards";

export function Dashboard({ role, practiceName, orders, invoices, setRoute, setModal }: {
  role: Role;
  practiceName?: string;
  orders: WorkOrder[];
  invoices: Invoice[];
  setRoute: (route: string) => void;
  setModal: (modal: string) => void;
}) {
  const visibleOrders = filterDashboardOrders(role, orders, practiceName);
  const cards = buildDashboardMetrics(role, orders, invoices, practiceName).map(
    ([label, value, target, format]) => [label, format === "currency" ? money(value) : value, target] as const,
  );
  const distribution = buildStatusDistribution(visibleOrders);
  const priorityOrders = visibleOrders.filter(order => !["Closed", "Cancelled", "Draft"].includes(order.status)).slice(0, 4);
  const veterinaryView = role === "Veterinary Practice";
  const canCreateWorkOrder = role === "GAP Administrator" || role === "GAP Case Manager";
  const pageAction = canCreateWorkOrder ? "Create work order" : veterinaryView ? "Submit invoice" : role === "Finance Approver" ? "Review invoices" : undefined;

  function runPageAction() {
    if (canCreateWorkOrder) setModal("work-order");
    else if (veterinaryView || role === "Finance Approver") setRoute("invoices");
  }

  return <>
    <PageHead
      eyebrow={veterinaryView ? "VETERINARY PRACTICE" : role === "Finance Approver" ? "FINANCE OVERVIEW" : "GAP OPERATIONS"}
      title={veterinaryView ? practiceName || "Veterinary dashboard" : `${role} dashboard`}
      subtitle={veterinaryView ? "Your assigned emergency work and invoice position." : "Current emergency-care and finance position across the network."}
      action={pageAction}
      onAction={runPageAction}
    />
    <div className="notice-banner">
      <b>{veterinaryView ? "Practice-scoped view" : "Shared operational view"}</b>
      <span>{veterinaryView
        ? "Only work orders and invoices for your authenticated veterinary practice are included."
        : "Dashboard figures are calculated from current portal records; finance output is available only after invoice approval."}</span>
    </div>
    <div className="metric-grid">{cards.map(([label, value, target], index) => <button className="metric" key={label} onClick={() => setRoute(target)}>
      <span className={`metric-icon m${index}`}>{["↗", "◷", "✚", "!"][index]}</span>
      <small>{label}</small><strong>{value}</strong><em>View details →</em>
    </button>)}</div>
    <div className="dash-grid">
      <section className="panel wide">
        <div className="panel-head"><div><h2>{veterinaryView ? "Your priority work" : "Priority work"}</h2><p>Cases requiring attention</p></div><button onClick={() => setRoute("work-orders")}>View all</button></div>
        <div className="work-cards">{priorityOrders.map(order => <button key={order.id} onClick={() => setRoute("work-orders")}>
          <div><b>{order.id}</b><span className={badge(order.priority)}>{order.priority}</span></div>
          <h3>{order.dogs.join(", ")}</h3><p>{order.practice}</p>
          <div><span className={badge(order.status)}>{order.status}</span><small>{order.due}</small></div>
        </button>)}</div>
        {!priorityOrders.length ? <div className="empty"><b>No priority work</b><span>{veterinaryView && !practiceName ? "Your account needs a veterinary practice name before assignments can be displayed." : "There are no open cases requiring attention."}</span></div> : null}
      </section>
      <section className="panel">
        <div className="panel-head"><div><h2>Status distribution</h2><p>{veterinaryView ? "Your open work orders" : "Open work orders"}</p></div></div>
        <div className="donut-wrap">
          <div className="donut"><b>{distribution.open}</b><span>open</span></div>
          <ul>
            <li><i className="c1" /> Active <b>{distribution.active}</b></li>
            <li><i className="c2" /> Awaiting <b>{distribution.awaiting}</b></li>
            <li><i className="c3" /> Action needed <b>{distribution.actionNeeded}</b></li>
          </ul>
        </div>
      </section>
    </div>
  </>;
}
