/**
 * Team JAM contribution: JUBAYER ALAM
 * React application shell: session state, routing, layout chrome and the shared record modal.
 * Every operational record is real, shared Firestore data (see app/lib/repositories) —
 * this file wires the live subscriptions to the screens, it doesn't own the data itself.
 */
"use client";

import { FormEvent, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  Role, WorkOrder, WorkOrderStatus, Invoice, Notice, Audit, Incident, Greyhound, Practice, UserProfile,
  nav, restricted, isWorkOrderInVetWorklist, isVisibleToSession, isNoticeVisible,
  incidentToRow, greyhoundToRow, practiceToRow,
} from "./shared/types";
import { Modal } from "./shared/Modal";
import { Auth } from "./features/auth/Auth";
import { Dashboard } from "./features/dashboard/Dashboard";
import { WorkOrders } from "./features/work-orders/WorkOrders";
import { OrderDetail } from "./features/work-orders/OrderDetail";
import { WorkOrderReviewModal } from "./features/work-orders/WorkOrderReviewModal";
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
import { auth, friendlyAuthError, isStrongPassword, loadProfile, requestPasswordReset, signIn, signOutUser, signUp } from "./contributions/ankita-auth";
import { parseInvoiceFields, parseWorkOrderFields } from "./contributions/jubayer-workflows";
import { createGreyhoundRecord } from "./contributions/arjun-greyhounds";
import { listRegisteredVets, VetDirectoryEntry } from "./lib/vet-directory";
import { acceptWorkOrder, advanceWorkOrderStatus, createWorkOrder, reassignWorkOrder, rejectWorkOrder, subscribeWorkOrders } from "./lib/repositories/work-orders";
import { createInvoice, reviewInvoice, subscribeInvoices } from "./lib/repositories/invoices";
import { createIncident, subscribeIncidents } from "./lib/repositories/incidents";
import { createGreyhound, subscribeGreyhounds } from "./lib/repositories/greyhounds";
import { registerPractice, subscribePractices } from "./lib/repositories/practices";
import { markAllNotificationsRead, markNotificationRead, subscribeNotifications } from "./lib/repositories/notifications";
import { logSignIn, subscribeAuditLog } from "./lib/repositories/audit-log";

function canViewTab(role: Role, tabId: string) {
  return !restricted[tabId] || restricted[tabId].includes(role);
}

export default function PortalApp() {
  const [session, setSession] = useState<UserProfile | null>(null);
  const [screen, setScreen] = useState("login");
  const [route, setRoute] = useState("dashboard");
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [greyhounds, setGreyhounds] = useState<Greyhound[]>([]);
  const [practices, setPractices] = useState<Practice[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [vets, setVets] = useState<VetDirectoryEntry[]>([]);
  const [search, setSearch] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  const [modal, setModal] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) { setSession(null); setScreen("login"); return; }
      const profile = await loadProfile(user.uid, user.email || "");
      setSession(profile); setScreen("app"); setRoute("dashboard");
      logSignIn({ name: profile.fullName, role: profile.role });
    });
  }, []);

  // Practice directory is public/pre-auth on purpose: the sign-up form needs it
  // to populate a vet's "which practice do you work at" dropdown before they have a session.
  useEffect(() => {
    return subscribePractices(setPractices, message => setToast(message));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!session) { setVets([]); return; }
    listRegisteredVets().then(setVets).catch(() => setVets([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.uid]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!session) { setOrders([]); return; }
    return subscribeWorkOrders(session, setOrders, message => setToast(message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.uid, session?.role]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!session) { setInvoices([]); return; }
    return subscribeInvoices(session, setInvoices, message => setToast(message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.uid, session?.role, session?.practice]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!session || !canViewTab(session.role, "incidents")) { setIncidents([]); return; }
    return subscribeIncidents(setIncidents, message => setToast(message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.uid, session?.role]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!session) { setGreyhounds([]); return; }
    return subscribeGreyhounds(setGreyhounds, message => setToast(message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.uid]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!session) { setNotices([]); return; }
    return subscribeNotifications(session, setNotices, message => setToast(message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.uid, session?.role]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!session || !canViewTab(session.role, "audit")) { setAudits([]); return; }
    return subscribeAuditLog(setAudits, message => setToast(message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.uid, session?.role]);

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(""), 3200); return () => clearTimeout(t); } }, [toast]);

  const isReadOnly = session?.role === "GRNSW Auditor";
  const actor = session ? { name: session.fullName, role: session.role } : null;

  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const fd = new FormData(e.currentTarget);
    try { await signIn(String(fd.get("email")), String(fd.get("password")), Boolean(fd.get("remember"))); }
    catch (err) { setToast(friendlyAuthError(err)); }
  }
  async function logout() { await signOutUser(); setToast("Signed out securely"); }
  async function signup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password")); const confirmPassword = String(fd.get("confirmPassword"));
    if (password !== confirmPassword) { setToast("Passwords do not match"); return; }
    if (!isStrongPassword(password)) { setToast("Password does not meet the strength requirements"); return; }
    const role = String(fd.get("role")) as Role;
    const base = {
      email: String(fd.get("email")), fullName: `${fd.get("firstName")} ${fd.get("lastName")}`.trim(), phone: String(fd.get("phone")), role,
    };
    const profileData = role === "Veterinary Practice"
      ? { ...base, practice: String(fd.get("practice")), licenseNumber: String(fd.get("licenseNumber")), specialty: String(fd.get("specialty")) as UserProfile["specialty"], deaNumber: String(fd.get("deaNumber") || ""), emergencyContact: String(fd.get("emergencyContact")) }
      : { ...base, employeeId: String(fd.get("employeeId")), branch: String(fd.get("branch")) };
    try { await signUp(profileData, password); }
    catch (err) { setToast(friendlyAuthError(err)); }
  }
  async function forgotPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const fd = new FormData(e.currentTarget);
    try { await requestPasswordReset(String(fd.get("email"))); setScreen("sent"); }
    catch (err) { setToast(friendlyAuthError(err)); }
  }

  async function transition(order: WorkOrder, status: WorkOrderStatus) {
    if (!session) return;
    try { await advanceWorkOrderStatus(order.id, status, { name: session.fullName, role: session.role, uid: session.uid }); setToast(`${order.id} updated`); }
    catch (err) { setToast(err instanceof Error ? err.message : "That status change isn't allowed."); }
  }
  async function acceptReviewOrder(order: WorkOrder) {
    if (!session) return;
    try { await acceptWorkOrder(order.id, { name: session.fullName, role: session.role, uid: session.uid }); setToast(`${order.id} accepted`); }
    catch (err) { setToast(err instanceof Error ? err.message : "Could not accept this work order."); }
    setReviewOrderId(null);
  }
  async function rejectReviewOrder(order: WorkOrder) {
    if (!session) return;
    try { await rejectWorkOrder(order.id, { name: session.fullName, role: session.role, uid: session.uid }); setToast(`${order.id} declined`); }
    catch (err) { setToast(err instanceof Error ? err.message : "Could not decline this work order."); }
    setReviewOrderId(null);
  }
  async function reassignReviewOrder(order: WorkOrder, vetUid: string) {
    if (!session) return;
    const vet = vets.find(v => v.uid === vetUid);
    if (!vet) { setToast("Select a vet to reassign to."); return; }
    try { await reassignWorkOrder(order.id, vet, { name: session.fullName, role: session.role }); setToast(`${order.id} reassigned to ${vet.fullName}`); }
    catch (err) { setToast(err instanceof Error ? err.message : "Could not reassign this work order."); }
    setReviewOrderId(null);
  }

  async function handleModalSubmit(data: Record<string, FormDataEntryValue>) {
    if (!session || !actor) return;
    try {
      if (modal === "work-order") {
        if (session.role === "Veterinary Practice") { setToast("Vets cannot create work orders."); setModal(null); return; }
        const vet = vets.find(v => v.uid === String(data.assignedVetUid));
        if (!vet) { setToast("Select a vet to assign this work order to."); return; }
        await createWorkOrder(parseWorkOrderFields(data), vet, actor);
      }
      if (modal === "invoice") { await createInvoice(parseInvoiceFields(data), actor); }
      if (modal === "incident") {
        await createIncident({
          occurredAt: new Date().toLocaleString("en-AU"),
          type: String(data.type),
          location: `${data.suburb} NSW`,
          greyhoundCount: 1,
          priority: String(data.priority),
          status: "Draft",
          summary: String(data.summary || ""),
        }, actor);
      }
      if (modal === "greyhound") { await createGreyhound(createGreyhoundRecord(data), actor); }
      if (modal === "practice") {
        const name = String(data.tradingName || data.legalName);
        await registerPractice({ id: name, name, approval: "Pending", operations: "Inactive", coverage: String(data.coverage), supplierRef: "Not mapped", avgResponse: "—" }, actor);
      }
      setModal(null); setToast("Saved successfully");
    } catch (err) { setToast(err instanceof Error ? err.message : "Could not save this record."); }
  }

  if (screen !== "app" || !session) return <Auth screen={screen} setScreen={setScreen} login={login} signup={signup} forgotPassword={forgotPassword} toast={toast} practices={practices.map(practiceToRow)} />;

  const visibleNav = nav.filter(([id]) => canViewTab(session.role, id));
  const worklistOrders = orders.filter(o => isWorkOrderInVetWorklist(session, o));
  const selectedOrder = selectedOrderId ? worklistOrders.find(o => o.id === selectedOrderId) || null : null;
  const visibleInvoices = invoices.filter(i => isVisibleToSession(session, i.practice));
  const visibleNotices = notices.filter(n => isNoticeVisible(session, n));
  const unread = visibleNotices.filter(n => !n.read).length;
  const reviewOrder = reviewOrderId ? orders.find(o => o.id === reviewOrderId) || null : null;

  return <div className={`portal ${collapsed ? "collapsed" : ""}`}>
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="brand"><div className="brand-mark">G</div><div><b>GAP</b><span>Emergency Portal</span></div></div>
      <button className="collapse" onClick={() => setCollapsed(!collapsed)} aria-label="Collapse navigation">{collapsed ? "›" : "‹"}</button>
      <nav>{visibleNav.map(([id, icon, label]) => <button key={id} className={route === id ? "active" : ""} onClick={() => { setRoute(id); setSelectedOrderId(null); }}><i>{icon}</i><span>{label}</span>{id === "notifications" && unread > 0 ? <em>{unread}</em> : null}</button>)}</nav>
      <div className="side-note"><b>Team JAM</b><span>Prototype • Synthetic data</span></div>
    </aside>
    <div className="main-shell">
      <header className="topbar">
        <div className="global-search"><span>⌕</span><input aria-label="Global search" placeholder="Search work orders, greyhounds, invoices…" value={search} onChange={e => setSearch(e.target.value)} /></div>
        <div className="top-actions">
          <button className="icon-button" onClick={() => setRoute("notifications")} aria-label={`${unread} unread notifications`}>♢{unread ? <b>{unread}</b> : null}</button>
          <div className="user"><div className="avatar">{session.fullName.split(" ").map(x => x[0]).join("").slice(0, 2)}</div><div><b>{session.fullName}</b><span>{session.role}</span></div><button onClick={logout}>Log out</button></div>
        </div>
      </header>
      <main>
        <div className="crumb">GAP Emergency Portal <span>/</span> {nav.find(x => x[0] === route)?.[2]}</div>
        {route === "dashboard" && <Dashboard role={session.role} orders={worklistOrders} invoices={visibleInvoices} setRoute={setRoute} setModal={setModal} />}
        {route === "incidents" && <Incidents rows={incidents.map(incidentToRow)} readOnly={isReadOnly} setModal={setModal} />}
        {route === "work-orders" && !selectedOrder && <WorkOrders orders={worklistOrders} search={search} role={session.role} setSelected={o => setSelectedOrderId(o.id)} setModal={setModal} />}
        {route === "work-orders" && selectedOrder && <OrderDetail order={selectedOrder} role={session.role} back={() => setSelectedOrderId(null)} transition={transition} setModal={setModal} />}
        {route === "greyhounds" && <Greyhounds rows={greyhounds.map(greyhoundToRow)} readOnly={isReadOnly} setModal={setModal} />}
        {route === "practices" && <Practices rows={practices.map(practiceToRow)} role={session.role} setModal={setModal} />}
        {route === "invoices" && <Invoices invoices={visibleInvoices} role={session.role} update={async (id, status) => {
          if (!actor) return;
          try { await reviewInvoice(id, status, actor); setToast(`${id}: ${status}`); }
          catch (err) { setToast(err instanceof Error ? err.message : "Could not update this invoice."); }
        }} setModal={setModal} />}
        {route === "notifications" && <Notifications notices={visibleNotices} onMarkRead={markNotificationRead} onMarkAll={() => markAllNotificationsRead(session, notices)} onOpenWorkOrder={setReviewOrderId} />}
        {route === "reports" && <Reports orders={orders} invoices={invoices} practices={practices} />}
        {route === "audit" && <AuditLog rows={audits} />}
        {route === "users" && <Users />}
        {route === "settings" && <Settings />}
        {route === "help" && <Help setToast={setToast} />}
      </main>
    </div>
    {modal && <Modal type={modal} close={() => setModal(null)} vets={vets} invoiceContext={{ orders: worklistOrders, invoices: visibleInvoices, practice: session.practice }} submit={handleModalSubmit} />}
    {reviewOrder && <WorkOrderReviewModal
      order={reviewOrder}
      role={session.role}
      sessionUid={session.uid}
      vets={vets}
      onClose={() => setReviewOrderId(null)}
      onAccept={() => acceptReviewOrder(reviewOrder)}
      onReject={() => rejectReviewOrder(reviewOrder)}
      onReassign={vetUid => reassignReviewOrder(reviewOrder, vetUid)}
    />}
    {toast ? <div className={`toast ${toast.includes("incorrect") ? "error" : ""}`} role="status">{toast}</div> : null}
    <footer>Prototype demonstration. Not for operational or clinical use. Coupa integration is deferred for this build.</footer>
  </div>;
}
