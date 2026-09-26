"use client";

import { PageHead } from "../../shared/PageHead";
import { Notice } from "../../shared/types";

export function Notifications({ notices, onMarkRead, onMarkAll, onOpenWorkOrder }: { notices: Notice[]; onMarkRead: (id: string) => void; onMarkAll: () => void; onOpenWorkOrder: (workOrderId: string) => void }) {
  function open(n: Notice) {
    onMarkRead(n.id);
    if (n.workOrderId) onOpenWorkOrder(n.workOrderId);
  }
  return <>
    <PageHead title="Notifications" subtitle="Operational updates requiring your attention" />
    <div className="toolbar">
      <span>{notices.filter(n => !n.read).length} unread</span>
      <button className="secondary" onClick={onMarkAll}>Mark all as read</button>
    </div>
    <div className="notification-list">{notices.map(n => <button key={n.id} className={n.read ? "read" : ""} onClick={() => open(n)}><i /><div><b>{n.text}</b><span>{n.time}</span></div><em>{n.workOrderId ? "Open work order →" : "View record →"}</em></button>)}</div>
    {!notices.length ? <div className="empty"><b>No notifications yet</b><span>You&rsquo;ll see updates here as work is assigned and reviewed.</span></div> : null}
  </>;
}
