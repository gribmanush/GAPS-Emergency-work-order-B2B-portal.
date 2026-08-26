/**
 * PLACEHOLDER — awaiting Ankita's implementation (Jira TJ-26 Sign in/Sign up, TJ-27 Forgot Password).
 * Replace this file with her real version at this exact path: app/contributions/ankita-auth.ts.
 * See CONTRIBUTING.md / CONTRIBUTION_INDEX.md at the repo root.
 */
export function validateDemoCredentials(
  email: string,
  password: string,
  allowedEmails: readonly string[],
) {
  const normalizedEmail = email.trim().toLowerCase();
  return {
    normalizedEmail,
    valid: allowedEmails.includes(normalizedEmail) && password === "Demo123!",
  };
}

export function passwordResetConfirmation() {
  return "Placeholder — Ankita's real password reset flow (TJ-27) replaces this message.";
}
