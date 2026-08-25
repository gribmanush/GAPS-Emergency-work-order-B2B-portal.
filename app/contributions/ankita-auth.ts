/**
 * PLACEHOLDER — pending Ankita's PR (TJ-26, TJ-27).
 * Minimal working logic so the app builds; not the reviewed/final version.
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
