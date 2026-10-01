/**
 * Team JAM contribution: ANKITA BASNET (TJ-72), rebuilt against Firestore.
 * Medical record view/edit per greyhound.
 */
"use client";

import { FormEvent, useState } from "react";
import { MedicalRecord } from "../../shared/types";

type MedicalRecordsProps = {
  rows: string[][];
  records: MedicalRecord[];
  canManage: (petName: string) => boolean;
  onSave: (record: MedicalRecord) => Promise<void>;
  userName: string;
};

function blankRecord(id: string, petName: string): MedicalRecord {
  return { id, petName, visitDate: "", diagnosis: "", treatment: "", medications: "", notes: "", updatedBy: "", updatedAt: "" };
}

export function MedicalRecords({ rows, records, canManage, onSave, userName }: MedicalRecordsProps) {
  const [selectedRef, setSelectedRef] = useState(rows[0]?.[0] || "");
  const [draft, setDraft] = useState<MedicalRecord | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedRow = rows.find(r => r[0] === selectedRef);
  const currentRecord = records.find(r => r.id === selectedRef) || (selectedRow ? blankRecord(selectedRef, selectedRow[1]) : null);
  const canEdit = selectedRow ? canManage(selectedRow[1]) : false;

  function beginEditing() {
    if (!currentRecord || !canEdit) return;
    setDraft({ ...currentRecord });
    setMessage("");
  }

  function updateDraft(field: keyof MedicalRecord, value: string) {
    setDraft(current => current ? { ...current, [field]: value } : current);
  }

  async function saveRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    if (!draft.visitDate.trim() || !draft.diagnosis.trim() || !draft.notes.trim()) {
      setMessage("Visit date, diagnosis and clinical notes are required.");
      return;
    }
    setSaving(true);
    try {
      await onSave({ ...draft, updatedBy: userName });
      setDraft(null);
      setMessage("Medical record updated successfully.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save this record.");
    } finally {
      setSaving(false);
    }
  }

  function cancelEditing() {
    setDraft(null);
    setMessage("Changes cancelled. The medical record was not updated.");
  }

  return (
    <section className="panel" style={{ marginTop: 24 }}>
      <h2>Medical records</h2>
      <p>View clinical information and update an existing medical record.</p>

      <label>Select greyhound
        <select value={selectedRef} onChange={e => { setSelectedRef(e.target.value); setDraft(null); setMessage(""); }}>
          {rows.map(row => <option key={row[0]} value={row[0]}>{row[0]} — {row[1]}</option>)}
        </select>
      </label>

      {message && <p role="status" style={{ marginTop: 16, fontWeight: 700 }}>{message}</p>}

      {!currentRecord && <p>No medical record is available.</p>}

      {currentRecord && !draft && (
        <div style={{ marginTop: 20 }}>
          <h3>{currentRecord.petName}</h3>
          <p><strong>GAP reference:</strong> {currentRecord.id}</p>
          <p><strong>Visit date:</strong> {currentRecord.visitDate || "Not recorded"}</p>
          <p><strong>Diagnosis:</strong> {currentRecord.diagnosis || "Not recorded"}</p>
          <p><strong>Treatment:</strong> {currentRecord.treatment || "Not recorded"}</p>
          <p><strong>Medications:</strong> {currentRecord.medications || "Not recorded"}</p>
          <p><strong>Clinical notes:</strong> {currentRecord.notes || "Not recorded"}</p>
          <p><strong>Last updated by:</strong> {currentRecord.updatedBy || "—"}</p>
          <p><strong>Last updated:</strong> {currentRecord.updatedAt || "—"}</p>
          {canEdit
            ? <button type="button" onClick={beginEditing}>Edit medical record</button>
            : <p>This record is read-only — only a vet currently treating this greyhound can edit it.</p>}
        </div>
      )}

      {draft && (
        <form onSubmit={saveRecord} style={{ marginTop: 20 }}>
          <h3>Edit medical record — {draft.petName}</h3>
          <div className="form-grid">
            <label>Visit date<input type="date" required value={draft.visitDate} onChange={e => updateDraft("visitDate", e.target.value)} /></label>
            <label>Diagnosis<input required value={draft.diagnosis} onChange={e => updateDraft("diagnosis", e.target.value)} /></label>
            <label>Treatment<input value={draft.treatment} onChange={e => updateDraft("treatment", e.target.value)} /></label>
            <label>Medications<input value={draft.medications} onChange={e => updateDraft("medications", e.target.value)} /></label>
            <label className="full">Clinical notes<textarea required rows={4} value={draft.notes} onChange={e => updateDraft("notes", e.target.value)} /></label>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
            <button type="button" onClick={cancelEditing} disabled={saving}>Cancel</button>
          </div>
        </form>
      )}
    </section>
  );
}
