/**
 * Team JAM contribution: JUBAYER ALAM
 * Emergency work order list and creation flow.
 */
"use client";

import { useState } from "react";
import { PageHead } from "../../shared/PageHead";
import { badge, money, Role, WorkOrder } from "../../shared/types";
import { downloadCsv } from "../../shared/csv";
import { sortVeterinaryTasks, veterinaryTaskCounts } from "../../contributions/aanay-sprint4";

export function WorkOrders({ orders, search, role, practiceName, setSelected, setModal }: { orders: WorkOrder[]; search: string; role: Role; practiceName?: string; setSelected: (o: WorkOrder) => void; setModal: (m: string) => void }) {
  const [filter, setFilter] = useState("All");
  const roleScopedOrders = role === "Veterinary Practice"
    ? practiceName ? orders.filter(order => order.practice === practiceName) : []
    : orders;
  const veterinaryView = role === "Veterinary Practice";
  const taskCounts = veterinaryTaskCounts(roleScopedOrders);
  const list = sortVeterinaryTasks(roleScopedOrders).filter(o => (filter === "All" || o.status === filter) && JSON.stringify(o).toLowerCase().includes(search.toLowerCase()));
  return <>
    <PageHead eyebrow={veterinaryView ? "MY TASKS" : "EMERGENCY CARE"} title={veterinaryView ? "Veterinary task management" : "Work orders"} subtitle={veterinaryView ? `Assignments for ${practiceName || "your practice"}, ordered by priority.` : "Assign, monitor and review emergency veterinary work"} action={!(["Veterinary Practice", "GRNSW Auditor"] as Role[]).includes(role) ? "Create work order" : undefined} onAction={() => setModal("work-order")} />
    {veterinaryView ? <div className="task-summary" aria-label="Veterinary task summary">
      <button onClick={() => setFilter("Awaiting Acknowledgement")}><small>New assignments</small><b>{taskCounts.newAssignments}</b></button>
      <button onClick={() => setFilter("Acknowledged")}><small>Acknowledged</small><b>{taskCounts.acknowledged}</b></button>
      <button onClick={() => setFilter("In Progress")}><small>In treatment</small><b>{taskCounts.inTreatment}</b></button>
      <button onClick={() => setFilter("Completed by Vet")}><small>Completed</small><b>{taskCounts.completed}</b></button>
    </div> : null}
    <div className="toolbar">
      <div className="filter-tabs">{(veterinaryView
        ? ["All", "Awaiting Acknowledgement", "Acknowledged", "In Progress", "Completed by Vet", "Declined"]
        : ["All", "Draft", "Awaiting Acknowledgement", "Acknowledged", "In Progress", "Completed by Vet", "Declined", "Closed"]
      ).map(f => <button className={filter === f ? "active" : ""} key={f} onClick={() => setFilter(f)}>{f}</button>)}</div>
      <button className="secondary" onClick={() => downloadCsv("work-orders.csv", roleScopedOrders)}>⇩ Export CSV</button>
    </div>
    <div className="table-card">
      <table>
        <thead><tr><th>Work order</th><th>Greyhound(s)</th><th>Priority</th><th>Practice</th><th>Status</th><th>Response</th><th>Limit</th><th></th></tr></thead>
        <tbody>{list.map(o => <tr key={o.id} onClick={() => setSelected(o)}><td><b>{o.id}</b><small>{o.incident}</small></td><td>{o.dogs.join(", ")}<small>{o.dogs.length} greyhound{o.dogs.length > 1 ? "s" : ""}</small></td><td><span className={badge(o.priority)}>{o.priority}</span></td><td>{o.practice}</td><td><span className={badge(o.status)}>{o.status}</span></td><td className={o.due === "Overdue" ? "danger" : ""}>{o.due}</td><td>{money(o.limit)}</td><td>›</td></tr>)}</tbody>
      </table>
      {!list.length ? <div className="empty"><b>No matching work orders</b><span>Try changing the status filter or search term.</span></div> : null}
    </div>
  </>;
}
