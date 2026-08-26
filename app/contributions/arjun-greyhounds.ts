/**
 * Team JAM contribution target: ARJUN SINGH
 * Jira: TJ-35 Greyhounds — records, status updates and related information.
 *
 * Evidence rule: Arjun should review, explain, test and commit this file himself.
 */
export const ARJUN_JIRA_ITEMS = ["TJ-35"] as const;

export const greyhoundDirectorySeed = [
  ["GAP-2918", "Milo", "Cobalt Runner", "985141000092118", "Active", "Medication sensitivity"],
  ["GAP-2921", "Ruby", "Red Horizon", "985141000092121", "In care", "Respiratory alert"],
  ["GAP-2927", "Jet", "Midnight Jet", "985141000092127", "Active", "None"],
  ["GAP-2884", "Luna", "Silver Moon", "985141000092084", "In care", "None"],
  ["GAP-2851", "Banjo", "Fast Banjo", "985141000092051", "Active", "Skin allergy"],
  ["GAP-2852", "Pepper", "Pepper Road", "985141000092052", "Active", "None"],
  ["GAP-2806", "Archie", "Archway Star", "985141000092006", "Active", "Previous leg injury"],
  ["GAP-2789", "Poppy", "Poppy Fields", "985141000091989", "Rehomed", "None"],
];

export function createGreyhoundRecord(data: Record<string, FormDataEntryValue>) {
  return [
    String(data.ref),
    String(data.petName),
    String(data.racingName || "Not recorded"),
    String(data.microchip || "Not recorded"),
    "Active",
    String(data.alerts || "None"),
  ];
}
