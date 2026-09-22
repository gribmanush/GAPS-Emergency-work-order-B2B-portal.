/**
 * Team JAM contribution: JUBAYER ALAM
 * Emergency work order list and creation flow.
 */
"use client";

import { useState } from "react";
import { PageHead } from "../../shared/PageHead";
import { badge, money, Role, WorkOrder } from "../../shared/types";
import { downloadCsv } from "../../shared/csv";

export function WorkOrders({ orders, search, role, practiceName, setSelected, setModal }: { orders: WorkOrder[]; search: string; role: Role; practiceName?: string; setSelected: (o: WorkOrder) => void; setModal: (m: string) => void }) {
  const [filter, setFilter] = useState("All");
  const roleScopedOrders = role === "Veterinary Practice"
    ? practiceName ? orders.filter(order => order.practice === practiceName) : []
    : orders;
  const list = roleScopedOrders.filter(o => (filter === "All" || o.status === filter) && JSON.stringify(o).toLowerCase().includes(search.toLowerCase()));
  return <>
    <PageHead eyebrow="EMERGENCY CARE" title="Work orders" subtitle="Assign, monitor and review emergency veterinary work" action={!(["Veterinary Practice", "GRNSW Auditor"] as Role[]).includes(role) ? "Create work order" : undefined} onAction={() => setModal("work-order")} />
    <div className="toolbar">
      <div className="filter-tabs">{["All", "Draft", "Awaiting Acknowledgement", "In Progress", "Completed by Vet", "Declined"].map(f => <button className={filter === f ? "active" : ""} key={f} onClick={() => setFilter(f)}>{f}</button>)}</div>
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
