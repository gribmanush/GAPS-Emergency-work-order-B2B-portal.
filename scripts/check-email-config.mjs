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
const missing = required.filter(name => !values.get(name) || placeholders.test(values.get(name)));

if (missing.length === 0) {
  console.log("Email configuration check passed: .dev.vars contains all required values.");
  process.exit(0);
}

console[warnOnly ? "warn" : "error"]([
  "Email notifications are not configured for local development.",
  "Run: cp .dev.vars.example .dev.vars",
  "Then add your own Resend sending-only API key and your Resend account email.",
  `Missing or placeholder values: ${missing.join(", ")}`,
  "See docs/EMAIL-NOTIFICATIONS.md for the safe setup and test steps.",
].join("\n"));

process.exit(warnOnly ? 0 : 1);
