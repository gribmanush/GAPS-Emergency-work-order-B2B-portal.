/**
 * Team JAM contribution: ANKITA BASNET (TJ-73), rebuilt against Firestore.
 * Document uploads per greyhound.
 */
"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { GreyhoundDocument } from "../../shared/types";

type Props = {
  rows: string[][];
  documents: GreyhoundDocument[];
  canManage: (petName: string) => boolean;
  onUpload: (fields: Omit<GreyhoundDocument, "id">) => Promise<void>;
  userName: string;
};

// Kept comfortably under Firestore's 1MiB document limit once base64-encoded (~4/3 inflation).
const MAX_FILE_SIZE = 700 * 1024;
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export function GreyhoundDocuments({ rows, documents, canManage, onUpload, userName }: Props) {
  const [selectedGreyhound, setSelectedGreyhound] = useState(rows[0]?.[0] ?? "");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const selectedRow = rows.find(r => r[0] === selectedGreyhound);
  const canUpload = selectedRow ? canManage(selectedRow[1]) : false;
  const selectedDocuments = useMemo(() => documents.filter(d => d.greyhoundRef === selectedGreyhound), [documents, selectedGreyhound]);

  function uploadDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") ?? "").trim();
    const documentType = String(formData.get("documentType") ?? "");
    const file = formData.get("file");

    if (!selectedGreyhound || !title || !documentType) { setMessage("Complete all required fields."); return; }
    if (!(file instanceof File) || file.size === 0) { setMessage("Choose a document to upload."); return; }
    if (!ALLOWED_TYPES.includes(file.type)) { setMessage("Only PDF, JPG and PNG files are allowed."); return; }
    if (file.size > MAX_FILE_SIZE) { setMessage("The file must be 700 KB or smaller."); return; }

    const reader = new FileReader();
    reader.onload = async () => {
      setUploading(true);
      try {
        await onUpload({
          greyhoundRef: selectedGreyhound,
          title,
          documentType,
          fileName: file.name,
          fileData: String(reader.result),
          uploadedBy: userName,
          uploadedAt: new Date().toLocaleString("en-AU"),
        });
        formRef.current?.reset();
        setMessage("Document uploaded successfully.");
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "The document could not be stored.");
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => setMessage("The document could not be read.");
    reader.readAsDataURL(file);
  }

  function cancelUpload() {
    formRef.current?.reset();
    setMessage("Upload cancelled.");
  }

  return (
    <section className="panel" style={{ marginTop: 24 }}>
      <h2>Greyhound documents</h2>
      <p>Upload and view documents stored against a greyhound profile.</p>

      <label className="full">Select greyhound
        <select value={selectedGreyhound} onChange={e => { setSelectedGreyhound(e.target.value); setMessage(""); }}>
          {rows.map(row => <option key={row[0]} value={row[0]}>{row[0]} — {row[1]}</option>)}
        </select>
      </label>

      {canUpload ? (
        <form ref={formRef} onSubmit={uploadDocument} className="form-grid">
          <label>Document title<input name="title" required /></label>
          <label>Document type
            <select name="documentType" defaultValue="" required>
              <option value="" disabled>Select type</option>
              <option value="Medical">Medical</option>
              <option value="Vaccination">Vaccination</option>
              <option value="Identification">Identification</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label className="full">File<input name="file" type="file" accept=".pdf,.jpg,.jpeg,.png" required /></label>
          <div className="full">
            <button type="submit" disabled={uploading}>{uploading ? "Uploading…" : "Upload document"}</button>{" "}
            <button type="button" onClick={cancelUpload} disabled={uploading}>Cancel</button>
          </div>
        </form>
      ) : <p>You have read-only access to this greyhound&rsquo;s documents.</p>}

      {message && <p role="status">{message}</p>}

      <h3>Uploaded documents</h3>
      {selectedDocuments.length === 0 ? <p>No documents have been uploaded for this greyhound.</p> : (
        <div className="table-card">
          <table>
            <thead><tr><th>Title</th><th>Type</th><th>File</th><th>Uploaded by</th><th>Uploaded</th></tr></thead>
            <tbody>{selectedDocuments.map(document => <tr key={document.id}>
              <td>{document.title}</td><td>{document.documentType}</td>
              <td><a href={document.fileData} download={document.fileName}>{document.fileName}</a></td>
              <td>{document.uploadedBy}</td><td>{document.uploadedAt}</td>
            </tr>)}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}
