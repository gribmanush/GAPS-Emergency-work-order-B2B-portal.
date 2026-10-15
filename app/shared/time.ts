import type { Timestamp } from "firebase/firestore";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// Computed fresh every time it's called, from a real Firestore timestamp —
// never a label frozen at the moment the record was written.
export function relativeTime(value?: Timestamp | Date | null): string {
  if (!value) return "Just now";
  const date = value instanceof Date ? value : value.toDate();
  const diff = Date.now() - date.getTime();
  if (diff < MINUTE) return "Just now";
  if (diff < HOUR) {
    const minutes = Math.floor(diff / MINUTE);
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }
  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  return date.toLocaleString("en-AU");
}

// A work order's `due` field is either a datetime-local ISO-ish string or a
// plain label ("Not set", "Overdue") — only reformat the ones that actually parse.
export function formatDue(due: string): string {
  const date = new Date(due);
  return Number.isNaN(date.getTime()) ? due : date.toLocaleString("en-AU");
}
