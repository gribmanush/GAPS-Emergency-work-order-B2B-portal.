/**
 * PLACEHOLDER — awaiting Ankita's implementation (Jira TJ-26 Sign in/Sign up, TJ-27 Forgot Password).
 * Replace this file with her real version at this exact path: app/features/auth/Auth.tsx.
 * See CONTRIBUTING.md / CONTRIBUTION_INDEX.md at the repo root.
 */
"use client";

import { FormEvent } from "react";
import { accounts } from "../../shared/types";

export function Auth({ login, quickLogin, toast }: { screen: string; setScreen: (s: string) => void; login: (e: FormEvent<HTMLFormElement>) => void; quickLogin: (e: string) => void; toast: string }) {
  return <div className="auth-page">
    <section className="auth-card">
      <h2>Sign in (placeholder)</h2>
      <p>Stand-in sign-in screen. Ankita's real Sign in / Sign up / Forgot password screens (TJ-26, TJ-27) replace this file.</p>
      <form onSubmit={login}>
        <label>Email address<input name="email" type="email" required defaultValue="manager@gap-demo.nsw" /></label>
        <label>Password<input name="password" type="password" required defaultValue="Demo123!" /></label>
        <button className="primary wide">Sign in</button>
      </form>
      <div className="demo-grid">{Object.entries(accounts).map(([email, a]) => <button key={email} onClick={() => quickLogin(email)}><b>{a.role}</b><span>{email}</span></button>)}</div>
    </section>
    {toast ? <div className="toast error">{toast}</div> : null}
  </div>;
}
