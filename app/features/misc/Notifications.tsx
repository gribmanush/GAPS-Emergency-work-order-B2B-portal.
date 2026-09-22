"use client";

import { useState } from "react";
import { PageHead } from "../../shared/PageHead";
import type { Notice } from "../../shared/types";

export function Notifications({ notices, setNotices, onOpen }: {
  notices: Notice[];
  setNotices: (notices: Notice[]) => void;
  onOpen: (notice: Notice) => void;
}) {
  const [filter, setFilter] = useState<"All" | "Unread">("All");
  const displayed = filter === "Unread" ? notices.filter(notice => !notice.read) : notices;

  function openNotice(notice: Notice) {
    setNotices(notices.map(item => item.id === notice.id ? { ...item, read: true } : item));
    onOpen(notice);
  }

  return <>
    <PageHead eyebrow="UPDATES" title="Notifications" subtitle="Assignments, status changes, invoice decisions and emergency updates" />
    <div className="toolbar">
      <div className="filter-tabs">{(["All", "Unread"] as const).map(item => <button className={filter === item ? "active" : ""} key={item} onClick={() => setFilter(item)}>{item}</button>)}</div>
      <div className="action-row"><span>{notices.filter(notice => !notice.read).length} unread</span><button className="secondary" disabled={!notices.some(notice => !notice.read)} onClick={() => setNotices(notices.map(notice => ({ ...notice, read: true })))}>Mark all as read</button></div>
    </div>
    <div className="notification-list">{displayed.map(notice => <button key={notice.id} className={notice.read ? "read" : ""} onClick={() => openNotice(notice)}>
      <i /><div><b>{notice.text}</b><span>{notice.category || "Operational update"} · {notice.time}{notice.recordId ? ` · ${notice.recordId}` : ""}</span></div><em>{notice.route ? "Open record →" : "Read"}</em>
    </button>)}</div>
    {!displayed.length ? <div className="empty"><b>No {filter.toLowerCase()} notifications</b><span>New workflow events will appear here.</span></div> : null}
  </>;
}
