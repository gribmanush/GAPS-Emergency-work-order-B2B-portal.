"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

type MedicalRecord = {
  greyhoundRef: string;
  petName: string;
  visitDate: string;
  diagnosis: string;
  treatment: string;
  medications: string;
  notes: string;
  updatedBy: string;
  updatedAt: string;
};

type MedicalRecordsProps = {
  rows: string[][];
  role: string;
  userName: string;
};

const STORAGE_KEY = "gap-medical-records";

function createInitialRecords(rows: string[][]): MedicalRecord[] {
  return rows.map((row, index) => ({
    greyhoundRef: row[0] || `GAP-${index + 1}`,
    petName: row[1] || "Unknown greyhound",
    visitDate: "2026-08-21",
    diagnosis: "Routine health assessment",
    treatment: "Continue clinical monitoring",
    medications: "None currently prescribed",
    notes: row[5] || "No current health alerts.",
    updatedBy: "Dr Mia Chen",
    updatedAt: "21/08/2026, 10:56 am",
  }));
}

export function MedicalRecords({
  rows,
  role,
  userName,
}: MedicalRecordsProps) {
  const [records, setRecords] = useState<MedicalRecord[]>(() =>
    createInitialRecords(rows)
  );
  const [selectedRef, setSelectedRef] = useState(rows[0]?.[0] || "");
  const [draft, setDraft] = useState<MedicalRecord | null>(null);
  const [message, setMessage] = useState("");
  const [isReady, setIsReady] = useState(false);

  const canEdit = role === "Veterinary Practice";

  useEffect(() => {
    try {
      const savedRecords = localStorage.getItem(STORAGE_KEY);

      if (savedRecords) {
        const parsedRecords = JSON.parse(savedRecords);

        if (Array.isArray(parsedRecords)) {
          setRecords(parsedRecords);
        }
      }
    } catch {
      setMessage("Saved medical records could not be loaded.");
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records, isReady]);

  const currentRecord = records.find(
    (record) => record.greyhoundRef === selectedRef
  );

  function beginEditing() {
    if (!currentRecord || !canEdit) return;

    setDraft({ ...currentRecord });
    setMessage("");
  }

  function updateDraft(field: keyof MedicalRecord, value: string) {
    setDraft((current) =>
      current ? { ...current, [field]: value } : current
    );
  }

  function saveRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft) return;

    if (
      !draft.visitDate.trim() ||
      !draft.diagnosis.trim() ||
      !draft.notes.trim()
    ) {
      setMessage("Visit date, diagnosis and clinical notes are required.");
      return;
    }

    const savedRecord: MedicalRecord = {
      ...draft,
      updatedBy: userName || role,
      updatedAt: new Date().toLocaleString("en-AU"),
    };

    setRecords((current) =>
      current.map((record) =>
        record.greyhoundRef === savedRecord.greyhoundRef
          ? savedRecord
          : record
      )
    );

    setDraft(null);
    setMessage("Medical record updated successfully.");
  }

  function cancelEditing() {
    setDraft(null);
    setMessage("Changes cancelled. The medical record was not updated.");
  }

  return (
    <section
      style={{
        marginTop: "24px",
        padding: "24px",
        background: "white",
        border: "1px solid #dfe3e8",
        borderRadius: "12px",
      }}
    >
      <h2>Medical records</h2>
      <p>View clinical information and update an existing medical record.</p>

      <label>
        Select greyhound
        <select
          value={selectedRef}
          onChange={(event) => {
            setSelectedRef(event.target.value);
            setDraft(null);
            setMessage("");
          }}
        >
          {records.map((record) => (
            <option
              key={record.greyhoundRef}
              value={record.greyhoundRef}
            >
              {record.greyhoundRef} — {record.petName}
            </option>
          ))}
        </select>
      </label>

      {message && (
        <p role="status" style={{ marginTop: "16px", fontWeight: 700 }}>
          {message}
        </p>
      )}

      {!currentRecord && <p>No medical record is available.</p>}

      {currentRecord && !draft && (
        <div style={{ marginTop: "20px" }}>
          <h3>{currentRecord.petName}</h3>

          <p>
            <strong>GAP reference:</strong> {currentRecord.greyhoundRef}
          </p>
          <p>
            <strong>Visit date:</strong> {currentRecord.visitDate}
          </p>
          <p>
            <strong>Diagnosis:</strong> {currentRecord.diagnosis}
          </p>
          <p>
            <strong>Treatment:</strong> {currentRecord.treatment}
          </p>
          <p>
            <strong>Medications:</strong> {currentRecord.medications}
          </p>
          <p>
            <strong>Clinical notes:</strong> {currentRecord.notes}
          </p>
          <p>
            <strong>Last updated by:</strong> {currentRecord.updatedBy}
          </p>
          <p>
            <strong>Last updated:</strong> {currentRecord.updatedAt}
          </p>

          {canEdit ? (
            <button type="button" onClick={beginEditing}>
              Edit medical record
            </button>
          ) : (
            <p>
              This record is read-only. Only Veterinary Practice users can
              edit medical records.
            </p>
          )}
        </div>
      )}

      {draft && (
        <form onSubmit={saveRecord} style={{ marginTop: "20px" }}>
          <h3>
            Edit medical record — {draft.petName}
          </h3>

          <div className="form-grid">
            <label>
              Visit date
              <input
                type="date"
                required
                value={draft.visitDate}
                onChange={(event) =>
                  updateDraft("visitDate", event.target.value)
                }
              />
            </label>

            <label>
              Diagnosis
              <input
                required
                value={draft.diagnosis}
                onChange={(event) =>
                  updateDraft("diagnosis", event.target.value)
                }
              />
            </label>

            <label>
              Treatment
              <input
                value={draft.treatment}
                onChange={(event) =>
                  updateDraft("treatment", event.target.value)
                }
              />
            </label>

            <label>
              Medications
              <input
                value={draft.medications}
                onChange={(event) =>
                  updateDraft("medications", event.target.value)
                }
              />
            </label>

            <label className="full">
              Clinical notes
              <textarea
                required
                rows={4}
                value={draft.notes}
                onChange={(event) =>
                  updateDraft("notes", event.target.value)
                }
              />
            </label>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "16px",
            }}
          >
            <button type="submit">Save changes</button>

            <button type="button" onClick={cancelEditing}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}