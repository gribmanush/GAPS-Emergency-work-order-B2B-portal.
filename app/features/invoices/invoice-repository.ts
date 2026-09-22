"use client";

import {
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import type {
  FinanceExportFormat,
  FinanceExportRecord,
  Invoice,
  InvoiceStatus,
  Role,
} from "../../shared/types";
import { assertFinanceReviewer, assertInvoiceTransition } from "./invoice-workflow";

export type InvoiceActor = {
  uid: string;
  email: string;
  name: string;
  role: Role;
};

export type InvoiceRepository = {
  subscribe(
    onValue: (invoices: Invoice[]) => void,
    onError: (message: string) => void,
  ): () => void;
  submit(invoice: Invoice): Promise<void>;
  review(
    id: string,
    nextStatus: Extract<InvoiceStatus, "Under Review" | "Approved — Ready for export" | "Rejected">,
    comment: string,
  ): Promise<void>;
  recordExport(
    invoice: Invoice,
    format: FinanceExportFormat,
    fileName: string,
    externalReference: string,
  ): Promise<FinanceExportRecord>;
};

export function createInvoiceRepository(actor: InvoiceActor): InvoiceRepository {
  return firestoreInvoiceRepository(actor);
}

function firestoreInvoiceRepository(actor: InvoiceActor): InvoiceRepository {
  const invoices = collection(db, "invoices");

  return {
    subscribe(onValue, onError) {
      const invoiceQuery = actor.role === "Veterinary Practice"
        ? query(invoices, where("submittedByUid", "==", actor.uid))
        : query(invoices);
      return onSnapshot(
        invoiceQuery,
        snapshot => {
          const rows = snapshot.docs
            .map(item => normaliseInvoice(item.id, item.data()))
            .sort((left, right) => right.submittedAt.localeCompare(left.submittedAt));
          onValue(rows);
        },
        error => onError(humaniseFirestoreError(error)),
      );
    },

    async submit(invoice) {
      requireCurrentUser(actor);
      if (actor.role !== "Veterinary Practice") {
        throw new Error("Only a veterinary practice can submit an invoice.");
      }
      const invoiceRef = doc(invoices, invoice.id);
      const auditRef = doc(collection(invoiceRef, "auditEvents"));
      await runTransaction(db, async transaction => {
        const existing = await transaction.get(invoiceRef);
        if (existing.exists()) throw new Error("An invoice with this ID already exists.");
        transaction.set(invoiceRef, {
          ...invoice,
          submittedByUid: actor.uid,
          submittedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        transaction.set(auditRef, {
          action: "Invoice submitted",
          fromStatus: null,
          toStatus: "Submitted",
          comment: "Submitted by veterinary practice",
          actorUid: actor.uid,
          actorEmail: actor.email,
          actorName: actor.name,
          actorRole: actor.role,
          createdAt: serverTimestamp(),
        });
      });
    },

    async review(id, nextStatus, comment) {
      requireCurrentUser(actor);
      assertFinanceReviewer(actor.role);
      if (nextStatus === "Rejected" && comment.trim().length < 5) {
        throw new Error("A clear rejection reason is required.");
      }

      const invoiceRef = doc(invoices, id);
      const auditRef = doc(collection(invoiceRef, "auditEvents"));
      await runTransaction(db, async transaction => {
        const current = await transaction.get(invoiceRef);
        if (!current.exists()) throw new Error("Invoice not found.");
        const currentStatus = current.data().status as InvoiceStatus;
        assertInvoiceTransition(currentStatus, nextStatus);
        transaction.update(invoiceRef, {
          status: nextStatus,
          reviewedBy: actor.name,
          reviewedAt: new Date().toISOString(),
          reviewComment: comment.trim(),
          reviewedByUid: actor.uid,
          updatedAt: serverTimestamp(),
        });
        transaction.set(auditRef, {
          action: nextStatus === "Rejected"
            ? "Invoice rejected"
            : nextStatus === "Under Review"
              ? "Invoice review started"
              : "Invoice approved",
          fromStatus: currentStatus,
          toStatus: nextStatus,
          comment: comment.trim(),
          actorUid: actor.uid,
          actorEmail: actor.email,
          actorName: actor.name,
          actorRole: actor.role,
          createdAt: serverTimestamp(),
        });
      });
    },

    async recordExport(invoice, format, fileName, externalReference) {
      requireCurrentUser(actor);
      assertFinanceReviewer(actor.role);
      if (invoice.status !== "Approved — Ready for export" && invoice.status !== "Exported") {
        throw new Error("Only an approved invoice can be exported.");
      }

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
        const latestStatus = current.data().status as InvoiceStatus;
        if (latestStatus !== "Approved — Ready for export" && latestStatus !== "Exported") {
          throw new Error("The invoice approval changed before export. Refresh and try again.");
        }
        transaction.set(exportRef, {
          ...record,
          createdByUid: actor.uid,
          createdAt: serverTimestamp(),
        });
        transaction.update(invoiceRef, {
          status: "Exported",
          exportedBy: actor.name,
          exportedAt: createdAt,
          exportReference: externalReference,
          exportedByUid: actor.uid,
          updatedAt: serverTimestamp(),
        });
        transaction.set(auditRef, {
          action: `Generated ${format.toUpperCase()} finance export`,
          fromStatus: latestStatus,
          toStatus: "Exported",
          comment: `File ${fileName}; reference ${externalReference}`,
          actorUid: actor.uid,
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

function requireCurrentUser(actor: InvoiceActor) {
  if (!auth.currentUser || auth.currentUser.uid !== actor.uid) {
    throw new Error("Your Firebase session has expired. Sign in again.");
  }
}

function humaniseFirestoreError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown Firestore error";
  if (message.includes("permission-denied")) {
    return "Firestore denied this invoice action. Sign in with the correct GAP finance or veterinary account.";
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
