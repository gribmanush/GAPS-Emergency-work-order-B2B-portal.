/**
 * PLACEHOLDER — pending Muhaimin's PR (TJ-35 Greyhounds).
 * Real implementation lives on his branch. This stub only exists so the app builds
 * and stays testable; it is not the real greyhound directory.
 */
"use client";

import { PageHead } from "../../shared/PageHead";

export function Greyhounds({ rows, readOnly, setModal }: { rows: string[][]; readOnly: boolean; setModal: (m: string) => void }) {
  return <>
    <PageHead title="Greyhound directory" subtitle="Placeholder — pending Muhaimin's PR." />
    <div className="notice-banner"><b>Greyhound directory not yet merged</b><span>Muhaimin&rsquo;s greyhound directory hasn&rsquo;t landed yet.</span></div>
  </>;
}
