"use client";

import { useState } from "react";
import { PageHead } from "../../shared/PageHead";
import { AccountEntry } from "../../lib/repositories/accounts";
import { badge } from "../../shared/types";

export function AccountsApproval({
  accounts, onApprove, onReject,
}: {
  accounts: AccountEntry[];
  onApprove: (account: AccountEntry) => void;
  onReject: (account: AccountEntry) => void;
}) {
  const [q, setQ] = useState("");
  const filtered = accounts.filter(a =>
    [a.fullName, a.email, a.role, a.reviewStatus].join(" ").toLowerCase().includes(q.toLowerCase()));

  return <>
    <PageHead title="Account approvals" subtitle="Every self-registered account, across all roles — review and revoke access after the fact" />
    <div className="toolbar">
      <div className="local-search">⌕ <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search accounts…" /></div>
    </div>
    <div className="table-card">
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{filtered.map(a => <tr key={a.uid}>
          <td><b>{a.fullName}</b></td>
          <td>{a.email}</td>
          <td>{a.role}</td>
          <td><span className={badge(a.reviewStatus)}>{a.reviewStatus}</span></td>
          <td>
            <button disabled={a.reviewStatus === "Approved"} onClick={() => onApprove(a)}>Approve</button>{" "}
            <button disabled={a.reviewStatus === "Rejected"} onClick={() => onReject(a)}>Reject</button>
          </td>
        </tr>)}</tbody>
      </table>
      {!filtered.length ? <div className="empty"><b>No accounts yet</b><span>Self-registered accounts will appear here.</span></div> : null}
    </div>
  </>;
}

// Shown instead of the table above to a GAP Administrator whose own account is
// still Pending — they can use the rest of the app normally, but can't review
// or approve anyone (including themselves) until an already-approved
// Administrator reviews their account first.
export function PendingAdminNotice({ approvers }: { approvers: AccountEntry[] }) {
  return <>
    <PageHead title="Account approvals" subtitle="Your account is still pending review" />
    <div className="table-card">
      <div className="empty">
        <b>Your account status is pending</b>
        <span>Ask an existing GAP Administrator to approve your account. Until then, you can use the portal normally, but you can&rsquo;t review or approve other accounts.</span>
      </div>
      {approvers.length ? <table>
        <thead><tr><th>Administrators who can approve your account</th><th>Email</th></tr></thead>
        <tbody>{approvers.map(a => <tr key={a.uid}><td><b>{a.fullName}</b></td><td>{a.email}</td></tr>)}</tbody>
      </table> : <div className="empty"><b>No approved GAP Administrator found</b><span>Contact your organisation directly to have your account approved.</span></div>}
    </div>
  </>;
}
