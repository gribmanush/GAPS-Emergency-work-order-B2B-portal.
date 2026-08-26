/**
 * Team JAM contribution target: ANKITA BASNET
 * Jira: TJ-26 Sign in and Sign up page; TJ-27 Forgot Password page.
 *
 * Evidence rule: Ankita should review, explain, test and commit this file herself.
 * The file's presence alone must not be represented as proof of authorship.
 */
export const ANKITA_JIRA_ITEMS = ["TJ-26", "TJ-27"] as const;

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
  return "If that address belongs to an account, reset instructions have been generated for this demonstration.";
}
