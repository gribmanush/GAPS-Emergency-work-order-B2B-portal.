/**
 * Team JAM contribution: JUBAYER ALAM
 * Shared pool of work orders staff left unassigned at creation time — any vet
 * can claim one outright, or GAP staff can still assign it to a specific vet.
 */
"use client";

import { useState } from "react";
import { PageHead } from "../../shared/PageHead";
import { badge, money, Role, WorkOrder } from "../../shared/types";
import type { VetDirectoryEntry } from "../../lib/vet-directory";

function PoolRow({ order, isGapStaff, vets, onClaim, onAssign }: {
  order: WorkOrder;
  isGapStaff: boolean;
  vets: VetDirectoryEntry[];
  onClaim: (orderId: string) => void;
  onAssign: (orderId: string, vetUid: string) => void;
}) {
  const [pickedVet, setPickedVet] = useState("");
  return <tr>
    <td><b>{order.id}</b><small>{order.incident}</small></td>
    <td>{order.dogs.join(", ")}<small>{order.dogs.length} greyhound{order.dogs.length > 1 ? "s" : ""}</small></td>
    <td><span className={badge(order.priority)}>{order.priority}</span></td>
    <td>{order.service}</td>
    <td className={order.due === "Overdue" ? "danger" : ""}>{order.due}</td>
    <td>{money(order.limit)}</td>
    <td>
      {isGapStaff
        ? <div className="inline-assign">
            <select value={pickedVet} onChange={e => setPickedVet(e.target.value)} disabled={!vets.length}>
              <option value="">{vets.length ? "Select a registered vet" : "No registered vets available yet"}</option>
              {vets.map(v => <option key={v.uid} value={v.uid}>{v.fullName}{v.practice ? ` — ${v.practice}` : ""}</option>)}
            </select>
            <button type="button" className="secondary" disabled={!pickedVet} onClick={() => onAssign(order.id, pickedVet)}>Assign</button>
          </div>
        : <button type="button" className="primary" onClick={() => onClaim(order.id)}>Claim</button>}
    </td>
  </tr>;
}

export function WorkOrderPool({ orders, role, vets, onClaim, onAssign, setModal }: {
  orders: WorkOrder[];
  role: Role;
  vets: VetDirectoryEntry[];
  onClaim: (orderId: string) => void;
  onAssign: (orderId: string, vetUid: string) => void;
  setModal: (m: string) => void;
}) {
  const isGapStaff = role === "GAP Administrator" || role === "GAP Case Manager";
  return <>
    <PageHead eyebrow="EMERGENCY CARE" title="Work order pool" subtitle="Unassigned work orders any vet can claim"
      action={isGapStaff ? "Create work order" : undefined} onAction={() => setModal("work-order")} />
    <div className="table-card">
      <table>
        <thead><tr><th>Work order</th><th>Greyhound(s)</th><th>Priority</th><th>Requested service</th><th>Response</th><th>Limit</th><th></th></tr></thead>
        <tbody>{orders.map(o => <PoolRow key={o.id} order={o} isGapStaff={isGapStaff} vets={vets} onClaim={onClaim} onAssign={onAssign} />)}</tbody>
      </table>
      {!orders.length ? <div className="empty"><b>The pool is empty</b><span>Work orders left unassigned at creation will show up here until a vet claims them.</span></div> : null}
    </div>
  </>;
}
