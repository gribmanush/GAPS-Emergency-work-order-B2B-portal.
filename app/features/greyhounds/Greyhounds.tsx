/**
 * Team JAM contribution: ARJUN SINGH
 * Greyhound directory and status records.
 */
"use client";

import { Directory } from "../../shared/Directory";
import { GreyhoundDocuments } from "./GreyhoundDocuments";
import { MedicalRecords } from "./MedicalRecords";
import { GreyhoundDocument, MedicalRecord } from "../../shared/types";

type GreyhoundsProps = {
  rows: string[][];
  readOnly: boolean;
  setModal: (modal: string) => void;
  userName: string;
  medicalRecords: MedicalRecord[];
  documents: GreyhoundDocument[];
  canManageRecords: (petName: string) => boolean;
  onSaveMedicalRecord: (record: MedicalRecord) => Promise<void>;
  onUploadDocument: (fields: Omit<GreyhoundDocument, "id">) => Promise<void>;
};

export function Greyhounds({
  rows, readOnly, setModal, userName, medicalRecords, documents, canManageRecords, onSaveMedicalRecord, onUploadDocument,
}: GreyhoundsProps) {
  return (
    <>
      <Directory
        title="Greyhound directory"
        subtitle="Verified animal records used across emergency incidents"
        heads={["GAP reference", "Pet name", "Racing name", "Microchip", "Status", "Health alerts"]}
        rows={rows}
        action={!readOnly ? "Add greyhound" : undefined}
        onAction={() => setModal("greyhound")}
      />
      <MedicalRecords rows={rows} records={medicalRecords} canManage={canManageRecords} onSave={onSaveMedicalRecord} userName={userName} />
      <GreyhoundDocuments rows={rows} documents={documents} canManage={canManageRecords} onUpload={onUploadDocument} userName={userName} />
    </>
  );
}
