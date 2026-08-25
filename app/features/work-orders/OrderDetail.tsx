/**
 * Team JAM contribution: JUBAYER ALAM
 * Emergency work order detail view: status actions, financial authority and workflow timeline.
 */
"use client";

import { useState } from "react";
import { badge, money, Role, WorkOrder } from "../../shared/types";
import { TabContent } from "./TabContent";

export function OrderDetail({ order, role, back, transition, setModal }: { order: WorkOrder; role: Role; back: () => void; transition: (o: WorkOrder, s: string) => void; setModal: (m: string) => void }) {
  const [tab, setTab] = useState("Overview");
  const actions = role === "Veterinary Practice"
    ? (order.status === "Awaiting Acknowledgement" ? ["Acknowledge", "Decline"] : order.status === "Acknowledged" ? ["Start treatment"] : order.status === "In Progress" ? ["Complete veterinary work"] : [])
    : (["GAP Administrator", "GAP Case Manager"].includes(role) ? (order.status === "Declined" ? ["Reassign"] : order.status === "Completed by Vet" ? ["Request clarification", "Accept and close"] : []) : []);
  const target: Record<string, string> = { Acknowledge: "Acknowledged", Decline: "Declined", "Start treatment": "In Progress", "Complete veterinary work": "Completed by Vet", Reassign: "Awaiting Acknowledgement", "Request clarification": "In Progress", "Accept and close": "Closed" };
  return <>
    <button className="back-link" onClick={back}>← Back to work orders</button>
    <div className="detail-head">
      <div>
        <div className="title-line"><h1>{order.id}</h1><span className={badge(order.status)}>{order.status}</span><span className={badge(order.priority)}>{order.priority}</span></div>
        <p>{order.incident} · Last updated {order.updated}</p>
      </div>
      <div className="action-row">
        {actions.map(a => <button key={a} className={a === "Decline" || a.includes("clarification") ? "secondary" : "primary"} onClick={() => transition(order, target[a])}>{a}</button>)}
        {role === "Veterinary Practice" && order.status === "Completed by Vet" ? <button className="primary" onClick={() => setModal("invoice")}>Create invoice</button> : null}
      </div>
    </div>
    <div className="tabs">{["Overview", "Greyhounds", "Requested Services", "Treatment", "Assignment History", "Documents", "Invoice", "Activity & Audit"].map(t => <button className={tab === t ? "active" : ""} onClick={() => setTab(t)} key={t}>{t}</button>)}</div>
    {tab === "Overview" ? <div className="detail-grid">
      <section className="panel">
        <h2>Case details</h2>
        <dl>
          <div><dt>Incident</dt><dd>{order.incident}</dd></div>
          <div><dt>Greyhounds</dt><dd>{order.dogs.join(", ")}</dd></div>
          <div><dt>Veterinary practice</dt><dd>{order.practice}</dd></div>
          <div><dt>Requested service</dt><dd>{order.service}</dd></div>
          <div><dt>Response required</dt><dd>{order.due}</dd></div>
        </dl>
        <h3>Instructions</h3><p>{order.notes}</p>
      </section>
      <section className="panel finance-card">
        <h2>Financial authority</h2>
        <strong>{money(order.limit)}</strong>
        <div className="progress"><i style={{ width: "62%" }} /></div>
        <p>Estimated utilisation: 62%</p>
        <small>Additional spending requires GAP approval.</small>
      </section>
      <section className="panel timeline-panel">
        <h2>Workflow timeline</h2>
        <div className="timeline">{["Emergency identified", "Work order created", "Assigned to practice", "Acknowledged", "Treatment in progress", "Veterinary work completed", "GAP review", "Closed"].map((s, i) => <div className={i < 4 ? "done" : i === 4 ? "current" : ""} key={s}><i>{i < 4 ? "✓" : i + 1}</i><span><b>{s}</b><small>{i < 4 ? "Completed" : "Pending"}</small></span></div>)}</div>
      </section>
    </div> : <TabContent tab={tab} order={order} />}
  </>;
}
