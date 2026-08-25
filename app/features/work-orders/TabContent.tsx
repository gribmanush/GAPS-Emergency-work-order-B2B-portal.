/**
 * Team JAM contribution: JUBAYER ALAM
 * Secondary work-order detail tabs (greyhounds, requested services, etc.).
 */
"use client";

import { WorkOrder } from "../../shared/types";

export function TabContent({ tab, order }: { tab: string; order: WorkOrder }) {
  if (tab === "Greyhounds") return <div className="card-grid">{order.dogs.map((d, i) => <article className="record-card" key={d}><div className="dog-avatar">{d[0]}</div><div><h3>{d}</h3><p>GAP-{2918 + i} · Microchip verified</p><span className="badge active">Active record</span></div></article>)}</div>;
  if (tab === "Requested Services") return <div className="panel"><h2>Requested veterinary services</h2>{order.service.split(",").map((s, i) => <label className="service-row" key={s}><input type="checkbox" defaultChecked={i === 0} /><span><b>{s.trim()}</b><small>{i === 0 ? "Completed with clinical notes" : "Mandatory · awaiting completion"}</small></span></label>)}</div>;
  return <div className="panel empty-tab"><div>▤</div><h2>{tab}</h2><p>All {tab.toLowerCase()} records for {order.id} are shown here. This demonstration contains no additional records for the selected case.</p></div>;
}
