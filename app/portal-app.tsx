/**
 * Team JAM contribution: JUBAYER ALAM, Muhaiminul Choudhury
 * React application shell: session state, routing, layout chrome and the shared record modal.
 * Feature screens are implemented in ./features/* by their respective owners (see CONTRIBUTION_INDEX.md).
 */
"use client";

import { FormEvent, useEffect, useState } from "react";
import { Role,
  Session,
  WorkOrder,
  Invoice,
  Notice,
  Audit,
  roles,
  nav,
  restricted,
  accounts,
  canAccessWorkOrder,
} from "./shared/types";
import { seedOrders, seedInvoices, seedIncidents, seedPractices } from "./shared/seed-data";
import { Modal } from "./shared/Modal";
import { Auth } from "./features/auth/Auth";
import { Dashboard } from "./features/dashboard/Dashboard";
import { WorkOrders } from "./features/work-orders/WorkOrders";
import { OrderDetail } from "./features/work-orders/OrderDetail";
import { Invoices } from "./features/invoices/Invoices";
import { Greyhounds } from "./features/greyhounds/Greyhounds";
import { Incidents } from "./features/misc/Incidents";
import { Practices } from "./features/misc/Practices";
import { Notifications } from "./features/misc/Notifications";
import { Reports } from "./features/misc/Reports";
import { AuditLog } from "./features/misc/AuditLog";
import { Users } from "./features/misc/Users";
import { Settings } from "./features/misc/Settings";
import { Help } from "./features/misc/Help";
import { validateDemoCredentials } from "./contributions/ankita-auth";
import { createEmergencyWorkOrder, createTaxInvoice } from "./contributions/jubayer-workflows";
import { createGreyhoundRecord, greyhoundDirectorySeed } from "./contributions/arjun-greyhounds";

export default function PortalApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [screen, setScreen] = useState("login");
  const [route, setRoute] = useState("dashboard");
  const [orders, setOrders] = useState<WorkOrder[]>(seedOrders);
  const [invoices, setInvoices] = useState<Invoice[]>(seedInvoices);
  const [incidentRows, setIncidentRows] = useState<string[][]>(seedIncidents);
  const [greyhoundRows, setGreyhoundRows] = useState<string[][]>(greyhoundDirectorySeed);
  const [practiceRows, setPracticeRows] = useState<string[][]>(seedPractices);
  const [notices, setNotices] = useState<Notice[]>([
    { id: 1, text: "WO-2026-1041 is awaiting acknowledgement", time: "28 min ago", read: false },
    { id: 2, text: "Veterinary work completed for WO-2026-1039", time: "1 hr ago", read: false },
    { id: 3, text: "INV-8841 was submitted for review", time: "2 hrs ago", read: false },
    { id: 4, text: "WO-2026-1036 was declined and needs reassignment", time: "2 hrs ago", read: true },
  ]);
  const [audits, setAudits] = useState<Audit[]>([
    { id: 1, time: "21 Aug 2026, 11:16", user: "Dr Mia Chen", role: "Veterinary Practice", action: "Completed veterinary work", record: "WO-2026-1039" },
    { id: 2, time: "21 Aug 2026, 10:42", user: "Jordan Lee", role: "GAP Case Manager", action: "Assigned work order", record: "WO-2026-1041" },
    { id: 3, time: "21 Aug 2026, 09:54", user: "Dr Mia Chen", role: "Veterinary Practice", action: "Submitted invoice", record: "INV-8841" },
  ]);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [modal, setModal] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("gap-portal-state");
    if (saved) { try { const p = JSON.parse(saved); setOrders(p.orders || seedOrders); setInvoices(p.invoices || seedInvoices); setIncidentRows(p.incidentRows || seedIncidents); setGreyhoundRows(p.greyhoundRows || greyhoundDirectorySeed); setPracticeRows(p.practiceRows || seedPractices); setNotices(p.notices || []); setAudits(p.audits || []); } catch { } }
    const remembered = localStorage.getItem("gap-session"); if (remembered) { try { setSession(JSON.parse(remembered)); setScreen("app"); } catch { } }
  }, []);
  useEffect(() => { if (screen === "app") localStorage.setItem("gap-portal-state", JSON.stringify({ orders, invoices, incidentRows, greyhoundRows, practiceRows, notices, audits })); }, [orders, invoices, incidentRows, greyhoundRows, practiceRows, notices, audits, screen]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(""), 3200); return () => clearTimeout(t); } }, [toast]);

  const log = (action: string, record: string) => setAudits(a => [{ id: Date.now(), time: new Date().toLocaleString("en-AU"), user: session?.name || "Demo user", role: session?.role || "System", action, record }, ...a]);
  const notify = (text: string) => setNotices(n => [{ id: Date.now(), text, time: "Just now", read: false }, ...n]);
  const isReadOnly = session?.role === "GRNSW Auditor";
  const visibleNav = nav.filter(([id]) => !restricted[id] || restricted[id].includes(session?.role as Role));

  function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const fd = new FormData(e.currentTarget); const result = validateDemoCredentials(String(fd.get("email")), String(fd.get("password")), Object.keys(accounts)); const email = result.normalizedEmail;
    if (!result.valid) { setToast("Email or password is incorrect"); return; }
    const s = { email, ...accounts[email] }; setSession(s); setScreen("app"); setRoute("dashboard");
    if (fd.get("remember")) localStorage.setItem("gap-session", JSON.stringify(s)); log("Signed in", "SESSION");
  }
  function quickLogin(email: string) { const s = { email, ...accounts[email] }; setSession(s); setScreen("app"); setRoute("dashboard"); setToast(`Signed in as ${s.role}`); }
  function logout() { localStorage.removeItem("gap-session"); setSession(null); setScreen("login"); setToast("Signed out securely"); }
  function changeRole(role: Role) {
  if (!session) return;

  const practice =
    role === "Veterinary Practice"
      ? session.practice || accounts["vet@gap-demo.nsw"].practice
      : undefined;

  setSession({
    ...session,
    role,
    practice,
  });

  setSelectedOrder(null);
  setRoute("dashboard");
  setToast(`Prototype role changed to ${role}`);
}
Replace transition
Find the existing transition function and replace it with:
function transition(order: WorkOrder, status: string) {
  if (!session || !canAccessWorkOrder(session, order)) {
    setSelectedOrder(null);
    setToast("You do not have access to this work order");
    return;
  }

  const updatedOrder = {
    ...order,
    status,
    updated: "Just now",
  };

  setOrders((currentOrders) =>
    currentOrders.map((currentOrder) =>
      currentOrder.id === order.id
        ? updatedOrder
        : currentOrder,
    ),
  );

  setSelectedOrder(updatedOrder);
  log(`Status changed to ${status}`, order.id);
  notify(`${order.id} is now ${status}`);
  setToast(`${order.id} updated`);
}
  function transition(order: WorkOrder, status: string) { setOrders(os => os.map(o => o.id === order.id ? { ...o, status, updated: "Just now" } : o)); setSelectedOrder({ ...order, status, updated: "Just now" }); log(`Status changed to ${status}`, order.id); notify(`${order.id} is now ${status}`); setToast(`${order.id} updated`); }

  if (screen !== "app" || !session) return <Auth screen={screen} setScreen={setScreen} login={login} quickLogin={quickLogin} toast={toast} />;
  const unread = notices.filter(n => !n.read).length;
  const accessibleOrders = orders.filter((order) =>
  canAccessWorkOrder(session, order),
);

const accessibleSelectedOrder =
  selectedOrder &&
  canAccessWorkOrder(session, selectedOrder)
    ? selectedOrder
    : null;

  return <div className={`portal ${collapsed ? "collapsed" : ""}`}>
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="brand"><div className="brand-mark">G</div><div><b>GAP</b><span>Emergency Portal</span></div></div>
      <button className="collapse" onClick={() => setCollapsed(!collapsed)} aria-label="Collapse navigation">{collapsed ? "›" : "‹"}</button>
      <nav>{visibleNav.map(([id, icon, label]) => <button key={id} className={route === id ? "active" : ""} onClick={() => { setRoute(id); setSelectedOrder(null); }}><i>{icon}</i><span>{label}</span>{id === "notifications" && unread > 0 ? <em>{unread}</em> : null}</button>)}</nav>
      <div className="side-note"><b>Team JAM</b><span>Prototype • Synthetic data</span></div>
    </aside>
    <div className="main-shell">
      <header className="topbar">
        <div className="global-search"><span>⌕</span><input aria-label="Global search" placeholder="Search work orders, greyhounds, invoices…" value={search} onChange={e => setSearch(e.target.value)} /></div>
        <div className="top-actions">
          <label className="role-switch"><small>Prototype role</small><select value={session.role} onChange={e => changeRole(e.target.value as Role)}>{roles.map(r => <option key={r}>{r}</option>)}</select></label>
          <button className="icon-button" onClick={() => setRoute("notifications")} aria-label={`${unread} unread notifications`}>♢{unread ? <b>{unread}</b> : null}</button>
          <div className="user"><div className="avatar">{session.name.split(" ").map(x => x[0]).join("").slice(0, 2)}</div><div><b>{session.name}</b><span>{session.role}</span></div><button onClick={logout}>Log out</button></div>
        </div>
      </header>
      <main>
        <div className="crumb">GAP Emergency Portal <span>/</span> {nav.find(x => x[0] === route)?.[2]}</div>
        {route === "dashboard" && <Dashboard role={session.role} orders={accessibleOrders} invoices={invoices} setRoute={setRoute} setModal={setModal} />}
        {route === "incidents" && <Incidents rows={incidentRows} readOnly={isReadOnly} setModal={setModal} />}
        {route === "work-orders" && !selectedOrder && <WorkOrders orders={orders} search={search} role={session.role} setSelected={setSelectedOrder} setModal={setModal} />}
        {route === "work-orders" && selectedOrder && <OrderDetail order={selectedOrder} role={session.role} back={() => setSelectedOrder(null)} transition={transition} setModal={setModal} />}
        {route === "greyhounds" && <Greyhounds rows={greyhoundRows} readOnly={isReadOnly} setModal={setModal} />}
        {route === "practices" && <Practices rows={practiceRows} role={session.role} setModal={setModal} />}
        {route === "invoices" && <Invoices invoices={invoices} role={session.role} update={(id, status) => { setInvoices(xs => xs.map(x => x.id === id ? { ...x, status } : x)); log(`${status} invoice`, id); notify(`${id} is now ${status}`); setToast(`${id}: ${status}`); }} setModal={setModal} />}
        {route === "notifications" && <Notifications notices={notices} setNotices={setNotices} />}
        {route === "reports" && <Reports orders={orders} invoices={invoices} />}
        {route === "audit" && <AuditLog rows={audits} />}
        {route === "users" && <Users />}
        {route === "settings" && <Settings reset={() => { setOrders(seedOrders); setInvoices(seedInvoices); setIncidentRows(seedIncidents); setGreyhoundRows(greyhoundDirectorySeed); setPracticeRows(seedPractices); localStorage.removeItem("gap-portal-state"); log("Reset demonstration data", "SYSTEM"); setToast("Demonstration data restored"); }} />}
        {route === "help" && <Help setToast={setToast} />}
      </main>
    </div>
    {modal && <Modal type={modal} close={() => setModal(null)} submit={(data) => {
      if (modal === "work-order") { const next = createEmergencyWorkOrder(data, 1045 + orders.length) as WorkOrder; setOrders(o => [next, ...o]); log("Created work order", next.id); notify(`${next.id} was created`); }
      if (modal === "invoice") { const next = createTaxInvoice(data, 8850 + invoices.length) as Invoice; setInvoices(i => [next, ...i]); log("Submitted invoice", next.id); notify(`${next.id} was submitted for finance review`); }
      if (modal === "incident") { const id = `INC-2026-${91 + incidentRows.length}`; setIncidentRows(r => [[id, new Date().toLocaleString("en-AU"), String(data.type), `${data.suburb} NSW`, "1", String(data.priority), "Draft"], ...r]); log("Created emergency incident", id); }
      if (modal === "greyhound") { const record = createGreyhoundRecord(data); setGreyhoundRows(r => [record, ...r]); log("Added greyhound", record[0]); }
      if (modal === "practice") { const name = String(data.tradingName || data.legalName); setPracticeRows(r => [[name, "Pending", "Inactive", String(data.coverage), "Not mapped", "—"], ...r]); log("Registered veterinary practice", name); }
      setModal(null); setToast("Saved successfully");
    }} />}
    {toast ? <div className={`toast ${toast.includes("incorrect") ? "error" : ""}`} role="status">{toast}</div> : null}
    <footer>Prototype demonstration using synthetic data. Not for operational or clinical use. Coupa integration is deferred for this build.</footer>
  </div>;
}
