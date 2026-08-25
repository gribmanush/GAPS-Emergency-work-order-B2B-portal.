/**
 * PLACEHOLDER — pending Ankita's PR (TJ-26 sign in/sign up, TJ-27 forgot password).
 * Real implementation lives on her branch. This stub only exists so the app builds
 * and stays testable; it is not the real auth screen.
 */
"use client";

import { FormEvent } from "react";
import { accounts } from "../../shared/types";

export function Auth({ screen, setScreen, login, quickLogin, toast }: { screen: string; setScreen: (s: string) => void; login: (e: FormEvent<HTMLFormElement>) => void; quickLogin: (e: string) => void; toast: string }) {
  return <div className="auth-page">
    <section className="auth-card">
      <h2>Sign in — placeholder</h2>
      <p>Ankita&rsquo;s real sign-in, sign-up and forgot-password screens haven&rsquo;t been merged yet. Use a demo account below to continue testing the rest of the app.</p>
      <div className="demo-grid">{Object.entries(accounts).map(([email, a]) => <button key={email} onClick={() => quickLogin(email)}><b>{a.role}</b><span>{email}</span></button>)}</div>
      {toast ? <div className="toast error">{toast}</div> : null}
    </section>
  </div>;
}
