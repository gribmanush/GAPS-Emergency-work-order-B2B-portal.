/**
 * PLACEHOLDER — pending Muhaimin's PR (TJ-35).
 * Minimal working logic so the app builds; not the reviewed/final version.
 */
export const greyhoundDirectorySeed: string[][] = [];

export function createGreyhoundRecord(data: Record<string, FormDataEntryValue>) {
  return [
    String(data.ref || "Unassigned"),
    String(data.petName || "Unnamed"),
    String(data.racingName || "Not recorded"),
    String(data.microchip || "Not recorded"),
    "Active",
    String(data.alerts || "None"),
  ];
}
