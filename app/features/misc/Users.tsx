"use client";

import { PageHead } from "../../shared/PageHead";
import { accounts } from "../../shared/types";

export function Users() {
  return <>
    <PageHead title="User administration" subtitle="Manage portal access without permanently deleting history" />
    <div className="table-card">
      <table>
        <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Last login</th></tr></thead>
        <tbody>{Object.entries(accounts).map(([email, a], i) => <tr key={email}><td><b>{a.name}</b></td><td>{email}</td><td>{a.role}</td><td><span className="badge active">Active</span></td><td>{i < 3 ? "Today" : "Yesterday"}</td></tr>)}</tbody>
      </table>
    </div>
  </>;
}
