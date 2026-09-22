/**
 * Team JAM contribution: JUBAYER ALAM
 * React application shell: session state, routing, layout chrome and the shared record modal.
 * Feature screens are implemented in ./features/* by their respective owners (see CONTRIBUTION_INDEX.md).
 */
"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Role, WorkOrder, Invoice, InvoiceStatus, FinanceExportFormat, Notice, Audit, UserProfile, roles, nav, restricted } from "./shared/types";
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
import { auth, friendlyAuthError, isStrongPassword, loadProfile, requestPasswordReset, signIn, signOutUser, signUp } from "./contributions/ankita-auth";
import { createEmergencyWorkOrder, createTaxInvoice } from "./contributions/jubayer-workflows";
import { createGreyhoundRecord, greyhoundDirectorySeed } from "./contributions/arjun-greyhounds";
import { createInvoiceRepository, InvoiceRepository } from "./features/invoices/invoice-repository";
import { assertFinanceReviewer, assertInvoiceTransition, serializeFinanceExport, validateInvoiceSubmission } from "./features/invoices/invoice-workflow";
import { downloadInvoiceExport } from "./features/invoices/invoice-export";

export default function PortalApp() {
  const [session, setSession] = useState<UserProfile | null>(null);
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
  const [invoicePersistence, setInvoicePersistence] = useState<"firestore" | "connecting" | "error">("connecting");
  const [busyInvoiceId, setBusyInvoiceId] = useState<string | null>(null);
  const invoiceRepository = useRef<InvoiceRepository | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("gap-portal-state");
    // Hydrate legacy browser-local prototype modules after the client mounts.
    // Invoice data is deliberately excluded because Firestore is authoritative.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) { try { const p = JSON.parse(saved); setOrders(p.orders || seedOrders); setIncidentRows(p.incidentRows || seedIncidents); setGreyhoundRows(p.greyhoundRows || greyhoundDirectorySeed); setPracticeRows(p.practiceRows || seedPractices); setNotices(p.notices || []); setAudits(p.audits || []); } catch { } }
  }, []);
  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) { invoiceRepository.current = null; setSession(null); setScreen("login"); return; }
      const profile = await loadProfile(user.uid, user.email || "");
      setInvoicePersistence("connecting");
      setSession(profile); setScreen("app"); setRoute("dashboard");
      setAudits(a => [{ id: Date.now(), time: new Date().toLocaleString("en-AU"), user: profile.fullName, role: profile.role, action: "Signed in", record: "SESSION" }, ...a]);
    });
  }, []);
  useEffect(() => {
    if (!session) return;
    const actor = { uid: session.uid, email: session.email, name: session.fullName, role: session.role };
    const repository = createInvoiceRepository(actor);
    invoiceRepository.current = repository;
    return repository.subscribe(
      next => { setInvoices(next); setInvoicePersistence("firestore"); },
      message => { setInvoicePersistence("error"); setToast(message); },
    );
  }, [session]);
  useEffect(() => { if (screen === "app") localStorage.setItem("gap-portal-state", JSON.stringify({ orders, incidentRows, greyhoundRows, practiceRows, notices, audits })); }, [orders, incidentRows, greyhoundRows, practiceRows, notices, audits, screen]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(""), 3200); return () => clearTimeout(t); } }, [toast]);

  const log = (action: string, record: string) => setAudits(a => [{ id: Date.now(), time: new Date().toLocaleString("en-AU"), user: session?.fullName || "Demo user", role: session?.role || "System", action, record }, ...a]);
  const notify = (text: string) => setNotices(n => [{ id: Date.now(), text, time: "Just now", read: false }, ...n]);
  const isReadOnly = session?.role === "GRNSW Auditor";
  const visibleNav = nav.filter(([id]) => !restricted[id] || restricted[id].includes(session?.role as Role));

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
      ? { ...base, practiceName: String(fd.get("practiceName")), licenseNumber: String(fd.get("licenseNumber")), specialty: String(fd.get("specialty")) as UserProfile["specialty"], deaNumber: String(fd.get("deaNumber") || ""), emergencyContact: String(fd.get("emergencyContact")) }
      : { ...base, employeeId: String(fd.get("employeeId")), jobTitle: String(fd.get("jobTitle")) as UserProfile["jobTitle"], branch: String(fd.get("branch")) };
    try { await signUp(profileData, password); }
    catch (err) { setToast(friendlyAuthError(err)); }
  }
  async function forgotPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const fd = new FormData(e.currentTarget);
    try { await requestPasswordReset(String(fd.get("email"))); setScreen("sent"); }
    catch (err) { setToast(friendlyAuthError(err)); }
  }
  function changeRole(role: Role) { if (!session) return; setSession({ ...session, role }); setRoute("dashboard"); setToast(`Prototype role changed to ${role}`); }
  function transition(order: WorkOrder, status: string) { setOrders(os => os.map(o => o.id === order.id ? { ...o, status, updated: "Just now" } : o)); setSelectedOrder({ ...order, status, updated: "Just now" }); log(`Status changed to ${status}`, order.id); notify(`${order.id} is now ${status}`); setToast(`${order.id} updated`); }

  async function submitInvoice(data: Record<string, FormDataEntryValue>) {
    if (!session || session.role !== "Veterinary Practice") throw new Error("Sign in as a veterinary practice to submit an invoice.");
    const next = createTaxInvoice({ ...data, submittedBy: session.fullName }, Date.now()) as Invoice;
    const errors = validateInvoiceSubmission(next, orders.find(order => order.id === next.workOrder), invoices);
    if (errors.length) throw new Error(errors[0]);
    setBusyInvoiceId(next.id);
    try {
      if (!invoiceRepository.current) throw new Error("Firestore is not connected. Sign in again and retry.");
      await invoiceRepository.current.submit(next);
      log("Submitted invoice", next.id);
      notify(`${next.id} was submitted for finance review`);
      setModal(null);
      setToast(`${next.id} submitted for GAP finance review`);
    } finally { setBusyInvoiceId(null); }
  }

  async function reviewInvoice(invoice: Invoice, status: Extract<InvoiceStatus, "Under Review" | "Approved — Ready for export" | "Rejected">, comment: string) {
    if (!session) return;
    setBusyInvoiceId(invoice.id);
    try {
      assertFinanceReviewer(session.role);
      assertInvoiceTransition(invoice.status, status);
      if (status === "Rejected" && comment.trim().length < 5) throw new Error("Enter a clear rejection reason.");
      if (!invoiceRepository.current) throw new Error("Firestore is not connected. Sign in again and retry.");
      await invoiceRepository.current.review(invoice.id, status, comment);
      log(status === "Rejected" ? "Rejected invoice" : status === "Under Review" ? "Started invoice review" : "Approved invoice", invoice.id);
      notify(`${invoice.id} is now ${status}`);
      setToast(`${invoice.id}: ${status}`);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Invoice review failed.");
    } finally { setBusyInvoiceId(null); }
  }

  async function exportInvoice(invoice: Invoice, format: FinanceExportFormat) {
    if (!session) return;
    setBusyInvoiceId(invoice.id);
    try {
      assertFinanceReviewer(session.role);
      const output = serializeFinanceExport(invoice, format);
      const fileName = `${invoice.id.toLowerCase()}-finance-export.${output.extension}`;
      if (!invoiceRepository.current) throw new Error("Firestore is not connected. Sign in again and retry.");
      await invoiceRepository.current.recordExport(invoice, format, fileName, output.externalReference);
      downloadInvoiceExport(fileName, output.content, output.mimeType);
      log(`Generated ${format.toUpperCase()} finance export`, invoice.id);
      notify(`${invoice.id} export ${output.externalReference} generated`);
      setToast(`${fileName} downloaded and recorded`);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Invoice export failed.");
    } finally { setBusyInvoiceId(null); }
  }

  if (screen !== "app" || !session) return <Auth screen={screen} setScreen={setScreen} login={login} signup={signup} forgotPassword={forgotPassword} toast={toast} />;
  const unread = notices.filter(n => !n.read).length;

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
          <div className="user"><div className="avatar">{session.fullName.split(" ").map(x => x[0]).join("").slice(0, 2)}</div><div><b>{session.fullName}</b><span>{session.role}</span></div><button onClick={logout}>Log out</button></div>
        </div>
      </header>
      <main>
        <div className="crumb">GAP Emergency Portal <span>/</span> {nav.find(x => x[0] === route)?.[2]}</div>
        {route === "dashboard" && <Dashboard role={session.role} orders={orders} invoices={invoices} setRoute={setRoute} setModal={setModal} />}
        {route === "incidents" && <Incidents rows={incidentRows} readOnly={isReadOnly} setModal={setModal} />}
        {route === "work-orders" && !selectedOrder && <WorkOrders orders={orders} search={search} role={session.role} setSelected={setSelectedOrder} setModal={setModal} />}
        {route === "work-orders" && selectedOrder && <OrderDetail order={selectedOrder} role={session.role} back={() => setSelectedOrder(null)} transition={transition} setModal={setModal} />}
        {route === "greyhounds" && <Greyhounds rows={greyhoundRows} readOnly={isReadOnly} setModal={setModal} />}
        {route === "practices" && <Practices rows={practiceRows} role={session.role} setModal={setModal} />}
        {route === "invoices" && <Invoices invoices={invoices} role={session.role} persistence={invoicePersistence} busyId={busyInvoiceId} onReview={reviewInvoice} onExport={exportInvoice} setModal={setModal} />}
        {route === "notifications" && <Notifications notices={notices} setNotices={setNotices} />}
        {route === "reports" && <Reports orders={orders} invoices={invoices} />}
        {route === "audit" && <AuditLog rows={audits} />}
        {route === "users" && <Users />}
        {route === "settings" && <Settings reset={() => { setOrders(seedOrders); setInvoices(seedInvoices); setIncidentRows(seedIncidents); setGreyhoundRows(greyhoundDirectorySeed); setPracticeRows(seedPractices); localStorage.removeItem("gap-portal-state"); log("Reset demonstration data", "SYSTEM"); setToast("Demonstration data restored"); }} />}
        {route === "help" && <Help setToast={setToast} />}
      </main>
    </div>
    {modal && <Modal type={modal} close={() => setModal(null)} invoiceContext={{ orders, invoices, practice: session.practiceName || "Sydney Animal Emergency" }} submit={async (data) => {
      if (modal === "work-order") { const next = createEmergencyWorkOrder(data, 1045 + orders.length) as WorkOrder; setOrders(o => [next, ...o]); log("Created work order", next.id); notify(`${next.id} was created`); }
      if (modal === "invoice") { await submitInvoice(data); return; }
      if (modal === "incident") { const id = `INC-2026-${91 + incidentRows.length}`; setIncidentRows(r => [[id, new Date().toLocaleString("en-AU"), String(data.type), `${data.suburb} NSW`, "1", String(data.priority), "Draft"], ...r]); log("Created emergency incident", id); }
      if (modal === "greyhound") { const record = createGreyhoundRecord(data); setGreyhoundRows(r => [record, ...r]); log("Added greyhound", record[0]); }
      if (modal === "practice") { const name = String(data.tradingName || data.legalName); setPracticeRows(r => [[name, "Pending", "Inactive", String(data.coverage), "Not mapped", "—"], ...r]); log("Registered veterinary practice", name); }
      setModal(null); setToast("Saved successfully");
    }} />}
    {toast ? <div className={`toast ${toast.includes("incorrect") ? "error" : ""}`} role="status">{toast}</div> : null}
    <footer>Prototype using synthetic data. Approved invoices generate traceable JSON/CSV finance outputs; no live Coupa API is connected.</footer>
  </div>;
}
