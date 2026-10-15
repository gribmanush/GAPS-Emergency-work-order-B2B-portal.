import type { Greyhound, Incident, Practice, UserProfile } from "../shared/types";

type EmergencyCaseInput = {
  occurredAt: string;
  type: string;
  priority: string;
  suburb: string;
  postcode: string;
  summary: string;
  greyhoundIds: string;
  reporterContact: string;
};

export function buildEmergencyCase(
  input: EmergencyCaseInput,
  greyhounds: Greyhound[],
  reporterName: string,
): Omit<Incident, "id"> {
  const selectedIds = input.greyhoundIds.split(",").map(value => value.trim()).filter(Boolean);
  if (!selectedIds.length) throw new Error("Select at least one affected greyhound.");

  const selected = selectedIds.map(id => greyhounds.find(greyhound => greyhound.id === id));
  if (selected.some(greyhound => !greyhound)) throw new Error("One or more selected greyhounds are no longer available.");

  const suburb = input.suburb.trim();
  const postcode = input.postcode.trim();
  if (!suburb || !/^\d{4}$/.test(postcode)) throw new Error("Enter a suburb and valid four-digit postcode.");

  return {
    occurredAt: new Date(input.occurredAt).toLocaleString("en-AU"),
    type: input.type,
    location: `${suburb} NSW ${postcode}`,
    greyhoundCount: selectedIds.length,
    greyhoundIds: selectedIds,
    greyhoundNames: selected.map(greyhound => greyhound!.petName),
    priority: input.priority,
    status: "Draft",
    summary: input.summary.trim(),
    reporterName,
    reporterContact: input.reporterContact.trim(),
  };
}

export function isApprovedActivePractice(practice: Pick<Practice, "name" | "approval" | "operations">): boolean {
  return practice.approval === "Approved" && practice.operations === "Active";
}

export function eligibleVeterinaryProfiles(
  profiles: Array<Pick<UserProfile, "uid" | "fullName" | "email" | "practice" | "licenseNumber">>,
  practices: Array<Pick<Practice, "name" | "approval" | "operations">>,
) {
  const eligiblePractices = new Set(practices.filter(isApprovedActivePractice).map(practice => practice.name));
  return profiles
    .filter(profile => Boolean(profile.practice && profile.licenseNumber && eligiblePractices.has(profile.practice)))
    .map(profile => ({ uid: profile.uid, fullName: profile.fullName, email: profile.email, practice: profile.practice, licenseNumber: profile.licenseNumber }))
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}
