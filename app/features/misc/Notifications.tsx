"use client";

import { PageHead } from "../../shared/PageHead";
import { Notice } from "../../shared/types";

export function Notifications({ notices, setNotices }: { notices: Notice[]; setNotices: (n: Notice[]) => void }) {
  return <>
    <PageHead title="Notifications" subtitle="Operational updates requiring your attention" />
    <div className="toolbar">
      <span>{notices.filter(n => !n.read).length} unread</span>
      <button className="secondary" onClick={() => setNotices(notices.map(n => ({ ...n, read: true })))}>Mark all as read</button>
    </div>
    <div className="notification-list">{notices.map(n => <button key={n.id} className={n.read ? "read" : ""} onClick={() => setNotices(notices.map(x => x.id === n.id ? { ...x, read: true } : x))}><i /><div><b>{n.text}</b><span>{n.time}</span></div><em>View record →</em></button>)}</div>
  </>;
}
