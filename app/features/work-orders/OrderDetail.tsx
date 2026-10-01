/**
 * Team JAM contribution: JUBAYER ALAM
 * Emergency work order detail view: status actions, financial authority and workflow timeline.
 */
"use client";

import { useState } from "react";
import { badge, isWorkOrderStageAtLeast, money, Role, WORK_ORDER_SEQUENCE, WorkOrder, WorkOrderStatus, workOrderStageIndex } from "../../shared/types";
import { TabContent } from "./TabContent";

export function OrderDetail({ order, role, back, transition, setModal }: { order: WorkOrder; role: Role; back: () => void; transition: (o: WorkOrder, s: WorkOrderStatus) => void; setModal: (m: string) => void }) {
  const [tab, setTab] = useState("Overview");
  const isVet = role === "Veterinary Practice";
  const isGapStaff = role === "GAP Administrator" || role === "GAP Case Manager";

  const nextAction: { label: string; to: WorkOrderStatus } | null =
    isVet && order.status === "Accepted by Vet" ? { label: "Start treatment", to: "Treatment in Progress" } :
    isVet && order.status === "Treatment in Progress" ? { label: "Mark work completed", to: "Veterinary Work Completed" } :
    isGapStaff && order.status === "Veterinary Work Completed" ? { label: "Begin review", to: "GAP Review" } :
    isGapStaff && order.status === "GAP Review" ? { label: "Close work order", to: "Closed" } :
    null;
  const canInvoice = isVet && isWorkOrderStageAtLeast(order.status, "Veterinary Work Completed");
  const currentStage = workOrderStageIndex(order.status);

  return <>
    <button className="back-link" onClick={back}>← Back to work orders</button>
    <div className="detail-head">
      <div>
        <div className="title-line"><h1>{order.id}</h1><span className={badge(order.status)}>{order.status}</span><span className={badge(order.priority)}>{order.priority}</span></div>
        <p>{order.incident} · Assigned to {order.assignedVetName} · Last updated {order.updated}</p>
      </div>
      <div className="action-row">
        {nextAction ? <button className="primary" onClick={() => transition(order, nextAction.to)}>{nextAction.label}</button> : null}
        {canInvoice ? <button className="primary" onClick={() => setModal("invoice")}>Create invoice</button> : null}
      </div>
    </div>
    <div className="tabs">{["Overview", "Greyhounds", "Requested Services", "Treatment", "Assignment History", "Documents", "Invoice", "Activity & Audit"].map(t => <button className={tab === t ? "active" : ""} onClick={() => setTab(t)} key={t}>{t}</button>)}</div>
    {tab === "Overview" ? <div className="detail-grid">
      <section className="panel">
        <h2>Case details</h2>
        <dl>
          <div><dt>Incident</dt><dd>{order.incident}</dd></div>
          <div><dt>Greyhounds</dt><dd>{order.dogs.join(", ")}</dd></div>
          <div><dt>Assigned vet</dt><dd>{order.assignedVetName}</dd></div>
          <div><dt>Veterinary practice</dt><dd>{order.practice}</dd></div>
          <div><dt>Requested service</dt><dd>{order.service}</dd></div>
          <div><dt>Response required</dt><dd>{order.due}</dd></div>
        </dl>
        <h3>Instructions</h3><p>{order.notes}</p>
      </section>
      <section className="panel finance-card">
        <h2>Financial authority</h2>
        <strong>{money(order.limit)}</strong>
        <small>Additional spending requires GAP approval.</small>
      </section>
      <section className="panel timeline-panel">
        <h2>Workflow timeline</h2>
        <div className="timeline">{WORK_ORDER_SEQUENCE.map((stage, i) => <div className={i < currentStage ? "done" : i === currentStage ? "current" : ""} key={stage}><i>{i < currentStage ? "✓" : i + 1}</i><span><b>{stage}</b><small>{i < currentStage ? "Completed" : i === currentStage ? "In progress" : "Pending"}</small></span></div>)}</div>
      </section>
    </div> : <TabContent tab={tab} order={order} />}
  </>;
}
