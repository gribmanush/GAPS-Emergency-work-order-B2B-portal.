/**
 * PLACEHOLDER — awaiting Arjun's implementation (Jira TJ-35 Greyhounds).
 * Replace this file with his real version at this exact path: app/contributions/arjun-greyhounds.ts.
 * See CONTRIBUTING.md / CONTRIBUTION_INDEX.md at the repo root.
 */
export const greyhoundDirectorySeed: string[][] = [];

export function createGreyhoundRecord(data: Record<string, FormDataEntryValue>) {
  return [String(data.ref || ""), String(data.petName || ""), "Not recorded", "Not recorded", "Active", "None"];
}
