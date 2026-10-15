"use client";

import { useEffect, useState } from "react";
import { PageHead } from "../../shared/PageHead";
import { Notice } from "../../shared/types";
import { relativeTime } from "../../shared/time";

export function Notifications({ notices, onMarkRead, onMarkAll, onOpenWorkOrder, onOpenInvoice }: { notices: Notice[]; onMarkRead: (id: string) => void; onMarkAll: () => void; onOpenWorkOrder: (workOrderId: string) => void; onOpenInvoice: (invoiceId: string) => void }) {
  // Forces a re-render every minute so a displayed relative time ("Just now")
  // keeps advancing ("N minutes ago") even while the notice list itself is idle.
  const [, forceRefresh] = useState(0);
  useEffect(() => {
    const id = setInterval(() => forceRefresh(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);


  function open(n: Notice) {
    onMarkRead(n.id);
    if (n.workOrderId) onOpenWorkOrder(n.workOrderId);
    else if (n.invoiceId) onOpenInvoice(n.invoiceId);
  }
  return <>
    <PageHead title="Notifications" subtitle="Operational updates requiring your attention" />
    <div className="toolbar">
      <span>{notices.filter(n => !n.read).length} unread</span>
      <button className="secondary" onClick={onMarkAll}>Mark all as read</button>
    </div>
    <div className="notification-list">{notices.map(n => <button key={n.id} className={n.read ? "read" : ""} onClick={() => open(n)}><i /><div><b>{n.text}</b><span>{relativeTime(n.createdAt)}</span></div><em>{n.workOrderId ? "Open work order →" : n.invoiceId ? "Open invoice →" : "View record →"}</em></button>)}</div>
    {!notices.length ? <div className="empty"><b>No notifications yet</b><span>You&rsquo;ll see updates here as work is assigned and reviewed.</span></div> : null}
  </>;
}
