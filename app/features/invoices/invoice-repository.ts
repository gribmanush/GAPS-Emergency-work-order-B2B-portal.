"use client";

import {
  collection,
  doc,
  Firestore,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { ensureFirebaseSession, getFirebaseDb } from "../../lib/firebase";
import type {
  FinanceExportFormat,
  FinanceExportRecord,
  Invoice,
  InvoiceStatus,
  Role,
} from "../../shared/types";
import {
  assertFinanceReviewer,
  assertInvoiceTransition,
} from "./invoice-workflow";

export type InvoiceActor = {
  email: string;
  name: string;
  role: Role;
};

export type InvoiceRepository = {
  subscribe(
    onValue: (invoices: Invoice[]) => void,
    onError: (message: string) => void,
  ): () => void;
  submit(invoice: Invoice, actor: InvoiceActor): Promise<void>;
  review(
    id: string,
    nextStatus: Extract<InvoiceStatus, "Under Review" | "Approved — Ready for export" | "Rejected">,
    comment: string,
    actor: InvoiceActor,
  ): Promise<void>;
  recordExport(
    invoice: Invoice,
    format: FinanceExportFormat,
    fileName: string,
    externalReference: string,
    actor: InvoiceActor,
  ): Promise<FinanceExportRecord>;
};

export function createInvoiceRepository(): InvoiceRepository | null {
  const db = getFirebaseDb();
  return db ? firestoreInvoiceRepository(db) : null;
}

function firestoreInvoiceRepository(db: Firestore): InvoiceRepository {
  const invoices = collection(db, "invoices");

  return {
    subscribe(onValue, onError) {
      let unsubscribe: () => void = () => undefined;
      let active = true;
      void ensureFirebaseSession()
        .then(() => {
          if (!active) return;
          unsubscribe = onSnapshot(
            query(invoices, orderBy("submittedAt", "desc")),
            snapshot => onValue(snapshot.docs.map(item => normaliseInvoice(item.id, item.data()))),
            error => onError(humaniseFirestoreError(error)),
          );
        })
        .catch(error => onError(humaniseFirestoreError(error)));
      return () => { active = false; unsubscribe(); };
    },

    async submit(invoice, actor) {
      if (actor.role !== "Veterinary Practice") {
        throw new Error("Only a veterinary practice can submit an invoice.");
      }
      const firebaseUser = await ensureFirebaseSession();
      const invoiceRef = doc(invoices, invoice.id);
      const auditRef = doc(collection(invoiceRef, "auditEvents"));
      await runTransaction(db, async transaction => {
        const existing = await transaction.get(invoiceRef);
        if (existing.exists()) throw new Error("An invoice with this ID already exists.");
        transaction.set(invoiceRef, {
          ...invoice,
          submittedByUid: firebaseUser.uid,
          submittedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        transaction.set(auditRef, {
          action: "Invoice submitted",
          fromStatus: null,
          toStatus: "Submitted",
          comment: "Submitted by veterinary practice",
          actorEmail: actor.email,
          actorName: actor.name,
          actorRole: actor.role,
          createdAt: serverTimestamp(),
        });
      });
    },

    async review(id, nextStatus, comment, actor) {
      assertFinanceReviewer(actor.role);
      if (nextStatus === "Rejected" && comment.trim().length < 5) {
        throw new Error("A clear rejection reason is required.");
      }

      const firebaseUser = await ensureFirebaseSession();
      const invoiceRef = doc(invoices, id);
      const auditRef = doc(collection(invoiceRef, "auditEvents"));
      await runTransaction(db, async transaction => {
        const current = await transaction.get(invoiceRef);
        if (!current.exists()) throw new Error("Invoice not found.");
        const invoice = current.data() as Invoice;
        assertInvoiceTransition(invoice.status, nextStatus);
        transaction.update(invoiceRef, {
          status: nextStatus,
          reviewedBy: actor.name,
          reviewedAt: new Date().toISOString(),
          reviewComment: comment.trim(),
          reviewedByUid: firebaseUser.uid,
          updatedAt: serverTimestamp(),
        });
        transaction.set(auditRef, {
          action: nextStatus === "Rejected" ? "Invoice rejected" : nextStatus === "Under Review" ? "Invoice review started" : "Invoice approved",
          fromStatus: invoice.status,
          toStatus: nextStatus,
          comment: comment.trim(),
          actorEmail: actor.email,
          actorName: actor.name,
          actorRole: actor.role,
          createdAt: serverTimestamp(),
        });
      });
    },

    async recordExport(invoice, format, fileName, externalReference, actor) {
      assertFinanceReviewer(actor.role);
      if (invoice.status !== "Approved — Ready for export" && invoice.status !== "Exported") {
        throw new Error("Only an approved invoice can be exported.");
      }
      const firebaseUser = await ensureFirebaseSession();
      const createdAt = new Date().toISOString();
      const exportRef = doc(collection(db, "financeExports"));
      const invoiceRef = doc(invoices, invoice.id);
      const auditRef = doc(collection(invoiceRef, "auditEvents"));
      const record: FinanceExportRecord = {
        id: exportRef.id,
        invoiceId: invoice.id,
        invoiceVersion: invoice.version,
        format,
        externalReference,
        fileName,
        createdAt,
        createdBy: actor.name,
        status: "Generated",
      };

      await runTransaction(db, async transaction => {
        const current = await transaction.get(invoiceRef);
        if (!current.exists()) throw new Error("Invoice not found.");
        const latest = current.data() as Invoice;
        if (latest.status !== "Approved — Ready for export" && latest.status !== "Exported") {
          throw new Error("The invoice approval changed before export. Refresh and try again.");
        }
        transaction.set(exportRef, { ...record, createdByUid: firebaseUser.uid, createdAt: serverTimestamp() });
        transaction.update(invoiceRef, {
          status: "Exported",
          exportedBy: actor.name,
          exportedAt: createdAt,
          exportReference: externalReference,
          exportedByUid: firebaseUser.uid,
          updatedAt: serverTimestamp(),
        });
        transaction.set(auditRef, {
          action: `Generated ${format.toUpperCase()} finance export`,
          fromStatus: latest.status,
          toStatus: "Exported",
          comment: `File ${fileName}; reference ${externalReference}`,
          actorEmail: actor.email,
          actorName: actor.name,
          actorRole: actor.role,
          createdAt: serverTimestamp(),
        });
      });
      return record;
    },
  };
}

function humaniseFirestoreError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown Firestore error";
  if (message.includes("permission-denied")) {
    return "Firestore denied access. Check the signed-in role and security rules.";
  }
  return `Firestore invoice sync failed: ${message}`;
}

function normaliseInvoice(id: string, value: Record<string, unknown>): Invoice {
  return {
    ...value,
    id,
    submittedAt: timestampToIso(value.submittedAt),
    reviewedAt: timestampToIso(value.reviewedAt, true),
    exportedAt: timestampToIso(value.exportedAt, true),
  } as Invoice;
}

function timestampToIso(value: unknown, optional = false) {
  if (!value) return optional ? undefined : new Date(0).toISOString();
  if (typeof value === "string") return value;
  if (typeof value === "object" && value && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }
  return String(value);
}
