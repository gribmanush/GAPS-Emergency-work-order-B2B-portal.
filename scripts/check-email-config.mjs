import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const required = [
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "EMAIL_TEST_RECIPIENT",
  "GAP_NOTIFICATION_EMAIL",
  "FIREBASE_API_KEY",
];

const placeholders = /replace|example\.com|xxxxxxxx|your_/i;
const approvedSharedEndpoint = "https://gaps-emergency-work-order-b2b-portal.aanayv.workers.dev/api/notifications/email";
const file = resolve(process.cwd(), ".dev.vars");
const warnOnly = process.argv.includes("--warn");

function parseVars(contents) {
  const values = new Map();
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) continue;
    const name = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^(["'])(.*)\1$/, "$2");
    values.set(name, value);
  }
  return values;
}

const values = existsSync(file) ? parseVars(readFileSync(file, "utf8")) : new Map();
const sharedEndpoint = values.get("EMAIL_REMOTE_ENDPOINT");
const missing = required.filter(name => !values.get(name) || placeholders.test(values.get(name)));

if (!existsSync(file) || sharedEndpoint === approvedSharedEndpoint) {
  console.log("Email configuration check passed: using Team JAM's shared secured email service.");
  process.exit(0);
}

if (missing.length === 0 && !sharedEndpoint) {
  console.log("Email configuration check passed: .dev.vars contains all required values.");
  process.exit(0);
}

console[warnOnly ? "warn" : "error"]([
  "Email notifications are not configured for local development.",
  "Run: cp .dev.vars.example .dev.vars",
  sharedEndpoint
    ? "EMAIL_REMOTE_ENDPOINT is not the approved Team JAM endpoint."
    : "Use the shared endpoint in the example, or add your own Resend sending-only key.",
  `Missing or placeholder values: ${missing.join(", ")}`,
  "See docs/EMAIL-NOTIFICATIONS.md for the safe setup and test steps.",
].join("\n"));

process.exit(warnOnly ? 0 : 1);
