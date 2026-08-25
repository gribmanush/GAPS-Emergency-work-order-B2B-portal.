/**
 * Team JAM contribution: ANKITA BASNET
 * Sign in, forgot password and the demo-account sign-in grid.
 */
"use client";

import { FormEvent } from "react";
import { passwordResetConfirmation } from "../../contributions/ankita-auth";
import { accounts } from "../../shared/types";

export function Auth({ screen, setScreen, login, quickLogin, toast }: { screen: string; setScreen: (s: string) => void; login: (e: FormEvent<HTMLFormElement>) => void; quickLogin: (e: string) => void; toast: string }) {
  if (screen === "forgot") return <div className="auth-page">
    <div className="auth-brand"><div className="brand-mark large">G</div><h1>GAP Emergency<br />Veterinary Portal</h1><p>Secure coordination for emergency greyhound care.</p></div>
    <div className="auth-card">
      <button className="back-link" onClick={() => setScreen("login")}>← Back to sign in</button>
      <h2>Reset your password</h2>
      <p>Enter your account email. We&rsquo;ll simulate sending secure reset instructions.</p>
      <form onSubmit={e => { e.preventDefault(); setScreen("sent"); }}>
        <label>Email address<input type="email" required placeholder="name@organisation.nsw" /></label>
        <button className="primary wide">Send reset instructions</button>
      </form>
    </div>
  </div>;

  if (screen === "sent") return <div className="auth-page">
    <div className="auth-card success-card">
      <div className="success-icon">✓</div>
      <h2>Check your inbox</h2>
      <p>{passwordResetConfirmation()}</p>
      <button className="primary" onClick={() => setScreen("login")}>Return to sign in</button>
    </div>
  </div>;

  return <div className="auth-page">
    <section className="auth-brand">
      <div className="brand-mark large">G</div>
      <p className="eyebrow">GREYHOUNDS AS PETS NSW</p>
      <h1>Emergency Veterinary Portal</h1>
      <p>One secure workspace for incidents, veterinary work orders and invoice review.</p>
      <div className="trust"><span>● Role-based access</span><span>● Complete audit trail</span><span>● Synthetic demonstration data</span></div>
    </section>
    <section className="auth-card">
      <div className="mobile-brand">GAP NSW</div>
      <h2>Welcome back</h2>
      <p>Sign in to your authorised internal account.</p>
      <form onSubmit={login}>
        <label>Email address<input name="email" type="email" required defaultValue="manager@gap-demo.nsw" autoComplete="username" /></label>
        <label>Password<input name="password" type="password" required defaultValue="Demo123!" autoComplete="current-password" /></label>
        <div className="form-row">
          <label className="check"><input name="remember" type="checkbox" /> Remember me</label>
          <button type="button" className="link-button" onClick={() => setScreen("forgot")}>Forgot password?</button>
        </div>
        <button className="primary wide">Sign in</button>
        <button type="button" className="secondary wide" onClick={() => quickLogin("manager@gap-demo.nsw")}>▦ Sign in with Microsoft Entra ID <small>Demo</small></button>
      </form>
      <div className="divider"><span>Demonstration accounts</span></div>
      <div className="demo-grid">{Object.entries(accounts).map(([email, a]) => <button key={email} onClick={() => quickLogin(email)}><b>{a.role}</b><span>{email}</span></button>)}</div>
      <p className="authorised">Authorised internal use only. Activity may be recorded for governance and welfare assurance.</p>
    </section>
    {toast ? <div className="toast error">{toast}</div> : null}
  </div>;
}
