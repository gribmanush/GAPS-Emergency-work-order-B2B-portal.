/**
 * Team JAM contribution: JUBAYER ALAM
 * Opened from a notification: shows the full work order and offers whichever
 * action is relevant to the viewer — accept/reject for the assigned vet,
 * or reassign-to-another-vet for GAP staff once a vet has rejected it.
 */
"use client";

import { useState } from "react";
import { money, Role, WorkOrder } from "../../shared/types";
import type { VetDirectoryEntry } from "../../lib/vet-directory";

export function WorkOrderReviewModal({
  order, role, sessionUid, vets, onClose, onAccept, onReject, onReassign,
}: {
  order: WorkOrder;
  role: Role;
  sessionUid: string;
  vets: VetDirectoryEntry[];
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
  onReassign: (vetUid: string) => void;
}) {
  const [pickedVet, setPickedVet] = useState("");
  const isAssignedVet = role === "Veterinary Practice" && order.assignedVetUid === sessionUid;
  const awaitingThisVetsDecision = isAssignedVet && !order.needsReassignment && order.status === "Work Order Created and Assigned";
  const isGapStaff = role === "GAP Administrator" || role === "GAP Case Manager";
  const needsReassignment = isGapStaff && Boolean(order.needsReassignment);
  const reassignCandidates = vets.filter(v => v.uid !== order.assignedVetUid);

  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="modal" role="dialog" aria-modal="true" aria-label={`Work order ${order.id}`}>
      <div className="modal-head">
        <div><p className="eyebrow">WORK ORDER</p><h2>{order.id}</h2></div>
        <button onClick={onClose} aria-label="Close">×</button>
      </div>
      <div className="modal-body">
        {order.needsReassignment ? <div className="notice-banner notice-error"><b>Declined by {order.assignedVetName}</b><span>This work order needs to be reassigned to another vet.</span></div> : null}
        <dl>
          <div><dt>Incident</dt><dd>{order.incident}</dd></div>
          <div><dt>Greyhounds</dt><dd>{order.dogs.join(", ")}</dd></div>
          <div><dt>Priority</dt><dd>{order.priority}</dd></div>
          <div><dt>Requested service</dt><dd>{order.service}</dd></div>
          <div><dt>Response required</dt><dd>{order.due}</dd></div>
          <div><dt>Authorised limit</dt><dd>{money(order.limit)}</dd></div>
        </dl>
        <h3>Instructions</h3><p>{order.notes || "No additional instructions."}</p>

        {needsReassignment ? <label className="full">Assign to a different vet
          <select value={pickedVet} onChange={e => setPickedVet(e.target.value)} disabled={!reassignCandidates.length}>
            <option value="">{reassignCandidates.length ? "Select a registered vet" : "No other registered vets available"}</option>
            {reassignCandidates.map(v => <option key={v.uid} value={v.uid}>{v.fullName}{v.practice ? ` — ${v.practice}` : ""}</option>)}
          </select>
        </label> : null}
      </div>
      <div className="modal-actions">
        {awaitingThisVetsDecision ? <>
          <button type="button" className="danger-button" onClick={onReject}>Reject work</button>
          <button type="button" className="primary" onClick={onAccept}>Accept work</button>
        </> : needsReassignment ? <>
          <button type="button" className="secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="primary" disabled={!pickedVet} onClick={() => onReassign(pickedVet)}>Assign vet</button>
        </> : <button type="button" className="secondary" onClick={onClose}>Close</button>}
      </div>
    </div>
  </div>;
}
