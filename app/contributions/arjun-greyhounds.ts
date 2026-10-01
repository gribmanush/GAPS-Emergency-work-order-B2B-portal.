/**
 * Team JAM contribution target: ARJUN SINGH
 * Jira: TJ-35 Greyhounds — records, status updates and related information.
 *
 * Evidence rule: Arjun should review, explain, test and commit this file himself.
 */
import { Greyhound } from "../shared/types";

export const ARJUN_JIRA_ITEMS = ["TJ-35"] as const;

export function createGreyhoundRecord(data: Record<string, FormDataEntryValue>): Greyhound {
  return {
    id: String(data.ref),
    petName: String(data.petName),
    racingName: String(data.racingName || "Not recorded"),
    microchip: String(data.microchip || "Not recorded"),
    status: "Active",
    healthAlerts: String(data.alerts || "None"),
  };
}
