"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

type UploadedDocument = {
  id: string;
  greyhoundRef: string;
  title: string;
  documentType: string;
  fileName: string;
  fileData: string;
  uploadedBy: string;
  uploadedAt: string;
};

type Props = {
  rows: string[][];
  role: string;
  userName: string;
};

const STORAGE_KEY = "gap-greyhound-documents";
const MAX_FILE_SIZE = 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export function GreyhoundDocuments({ rows, role, userName }: Props) {
  const [selectedGreyhound, setSelectedGreyhound] = useState(
    rows[0]?.[0] ?? "",
  );
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const canUpload =
    role === "Veterinary Practice" || role.toLowerCase().includes("gap");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        setDocuments(JSON.parse(saved));
      } catch {
        setMessage("Saved documents could not be loaded.");
      }
    }
  }, []);

  const selectedDocuments = useMemo(
    () =>
      documents.filter(
        (document) => document.greyhoundRef === selectedGreyhound,
      ),
    [documents, selectedGreyhound],
  );

  function uploadDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") ?? "").trim();
    const documentType = String(formData.get("documentType") ?? "");
    const file = formData.get("file");

    if (!selectedGreyhound || !title || !documentType) {
      setMessage("Complete all required fields.");
      return;
    }

    if (!(file instanceof File) || file.size === 0) {
      setMessage("Choose a document to upload.");
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setMessage("Only PDF, JPG and PNG files are allowed.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setMessage("The file must be 1 MB or smaller.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const newDocument: UploadedDocument = {
        id: crypto.randomUUID(),
        greyhoundRef: selectedGreyhound,
        title,
        documentType,
        fileName: file.name,
        fileData: String(reader.result),
        uploadedBy: userName,
        uploadedAt: new Date().toLocaleString("en-AU"),
      };

      const updatedDocuments = [newDocument, ...documents];

      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(updatedDocuments),
        );
        setDocuments(updatedDocuments);
        formRef.current?.reset();
        setMessage("Document uploaded successfully.");
      } catch {
        setMessage("The document could not be stored.");
      }
    };

    reader.onerror = () => {
      setMessage("The document could not be read.");
    };

    reader.readAsDataURL(file);
  }

  function cancelUpload() {
    formRef.current?.reset();
    setMessage("Upload cancelled.");
  }

  return (
    <section className="card">
      <h2>Greyhound documents</h2>
      <p>Upload and view documents stored against a Greyhound profile.</p>

      <label className="full">
        Select Greyhound
        <select
          value={selectedGreyhound}
          onChange={(event) => {
            setSelectedGreyhound(event.target.value);
            setMessage("");
          }}
        >
          {rows.map((row) => (
            <option key={row[0]} value={row[0]}>
              {row[0]} — {row[1]}
            </option>
          ))}
        </select>
      </label>

      {canUpload ? (
        <form ref={formRef} onSubmit={uploadDocument} className="form-grid">
          <label>
            Document title
            <input name="title" required />
          </label>

          <label>
            Document type
            <select name="documentType" defaultValue="" required>
              <option value="" disabled>
                Select type
              </option>
              <option value="Medical">Medical</option>
              <option value="Vaccination">Vaccination</option>
              <option value="Identification">Identification</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label className="full">
            File
            <input
              name="file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              required
            />
          </label>

          <div className="full">
            <button type="submit">Upload document</button>{" "}
            <button type="button" onClick={cancelUpload}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <p>You have read-only access to Greyhound documents.</p>
      )}

      {message && <p role="status">{message}</p>}

      <h3>Uploaded documents</h3>

      {selectedDocuments.length === 0 ? (
        <p>No documents have been uploaded for this Greyhound.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>File</th>
                <th>Uploaded by</th>
                <th>Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {selectedDocuments.map((document) => (
                <tr key={document.id}>
                  <td>{document.title}</td>
                  <td>{document.documentType}</td>
                  <td>
                    <a href={document.fileData} download={document.fileName}>
                      {document.fileName}
                    </a>
                  </td>
                  <td>{document.uploadedBy}</td>
                  <td>{document.uploadedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}