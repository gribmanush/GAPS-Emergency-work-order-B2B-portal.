/**
 * Team JAM contribution: ANKITA BASNET
 * Sign in, sign up (role-aware fields) and forgot password.
 */
"use client";

import { FormEvent, useState } from "react";
import { PASSWORD_REQUIREMENTS } from "../../contributions/ankita-auth";
import { Role, roles, staffJobTitles, vetSpecialties } from "../../shared/types";

export function Auth({
  screen, setScreen, login, signup, forgotPassword, toast,
}: {
  screen: string;
  setScreen: (s: string) => void;
  login: (e: FormEvent<HTMLFormElement>) => void;
  signup: (e: FormEvent<HTMLFormElement>) => void;
  forgotPassword: (e: FormEvent<HTMLFormElement>) => void;
  toast: string;
}) {
  if (screen === "forgot") return <div className="auth-page">
    <div className="auth-brand"><div className="brand-mark large">G</div><h1>GAP Emergency<br />Veterinary Portal</h1><p>Secure coordination for emergency greyhound care.</p></div>
    <div className="auth-card">
      <button className="back-link" onClick={() => setScreen("login")}>← Back to sign in</button>
      <h2>Reset your password</h2>
      <p>Enter your account email and we&rsquo;ll send secure reset instructions.</p>
      <form onSubmit={forgotPassword}>
        <label>Email address<input name="email" type="email" required placeholder="name@organisation.nsw" /></label>
        <button className="primary wide">Send reset instructions</button>
      </form>
    </div>
    {toast ? <div className={`toast ${toast.includes("error") ? "error" : ""}`}>{toast}</div> : null}
  </div>;

  if (screen === "sent") return <div className="auth-page">
    <div className="auth-card success-card">
      <div className="success-icon">✓</div>
      <h2>Check your inbox</h2>
      <p>If that address belongs to an account, reset instructions have been sent.</p>
      <button className="primary" onClick={() => setScreen("login")}>Return to sign in</button>
    </div>
  </div>;

  if (screen === "signup") return <div className="auth-page">
    <section className="auth-brand">
      <div className="brand-mark large">G</div>
      <p className="eyebrow">GREYHOUNDS AS PETS NSW</p>
      <h1>Create your account</h1>
      <p>Register as a veterinary practice or GAP staff member to access the portal.</p>
    </section>
    <section className="auth-card signup-card">
      <div className="mobile-brand">GAP NSW</div>
      <h2>Create account</h2>
      <p>Choose your account type — the fields below adjust to match.</p>
      <SignupForm onSubmit={signup} />
      <p className="authorised"><button type="button" className="link-button" onClick={() => setScreen("login")}>← Already have an account? Sign in</button></p>
    </section>
    {toast ? <div className={`toast ${toast.toLowerCase().includes("error") || toast.toLowerCase().includes("match") || toast.toLowerCase().includes("incorrect") ? "error" : ""}`}>{toast}</div> : null}
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
        <label>Email address<input name="email" type="email" required autoComplete="username" /></label>
        <label>Password<input name="password" type="password" required autoComplete="current-password" /></label>
        <div className="form-row">
          <label className="check"><input name="remember" type="checkbox" /> Remember me</label>
          <button type="button" className="link-button" onClick={() => setScreen("forgot")}>Forgot password?</button>
        </div>
        <button className="primary wide">Sign in</button>
      </form>
      <div className="divider"><span>New here?</span></div>
      <button type="button" className="cta-signup wide" onClick={() => setScreen("signup")}>＋ Create a new account</button>
      <p className="authorised">Authorised internal use only. Activity may be recorded for governance and welfare assurance.</p>
    </section>
    {toast ? <div className={`toast ${toast.includes("incorrect") ? "error" : ""}`}>{toast}</div> : null}
  </div>;
}

function SignupForm({ onSubmit }: { onSubmit: (e: FormEvent<HTMLFormElement>) => void }) {
  const [role, setRole] = useState<Role>("Veterinary Practice");
  const isVet = role === "Veterinary Practice";

  return <form className="form-grid" onSubmit={onSubmit}>
    <label className="full">Account type
      <select name="role" value={role} onChange={e => setRole(e.target.value as Role)}>
        {roles.map(r => <option key={r}>{r}</option>)}
      </select>
    </label>
    <label>First name<input name="firstName" required /></label>
    <label>Last name<input name="lastName" required /></label>
    <label className="full">Email address<input name="email" type="email" required placeholder="name@organisation.nsw" /></label>
    <label>Phone number<input name="phone" type="tel" required /></label>

    {isVet ? <>
      <label className="full">Veterinary licence / registration number<small>The official ID issued by your state or national veterinary board.</small><input name="licenseNumber" required /></label>
      <label>Specialty / primary focus<select name="specialty">{vetSpecialties.map(s => <option key={s}>{s}</option>)}</select></label>
      <label>DEA / controlled substances licence number<small>Optional</small><input name="deaNumber" /></label>
      <label className="full">Emergency contact details<small>For after-hours on-call emergencies.</small><input name="emergencyContact" required placeholder="Name and phone number" /></label>
    </> : <>
      <label>Employee / payroll ID number<input name="employeeId" required /></label>
      <label>Job title<select name="jobTitle">{staffJobTitles.map(t => <option key={t}>{t}</option>)}</select></label>
      <label className="full">Assigned location / branch<input name="branch" required placeholder="e.g. Head office, Sydney" /></label>
    </>}

    <label>Password<input name="password" type="password" required autoComplete="new-password" /><small>{PASSWORD_REQUIREMENTS}</small></label>
    <label>Confirm password<input name="confirmPassword" type="password" required autoComplete="new-password" /></label>

    <button className="primary wide full">Create account</button>
  </form>;
}
