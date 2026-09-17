# TJ-110 — Coupa-ready invoice output

The client is not providing a Coupa API. The implemented boundary therefore proves that the portal can output an approved invoice in a stable, auditable format without claiming a live Coupa integration.

## Preconditions

- Invoice status is Approved — Ready for export or Exported.
- Supplier ID, work-order reference, dates, currency, totals and line items are present.
- GAP approval metadata is included.

## Output formats

- JSON preserves the canonical nested supplier, invoice, line and approval model.
- CSV produces one row per invoice line for a flat-file/import or middleware mapping.

Both formats include the schema version, source system, immutable external reference, supplier, dates, AUD currency, work-order reference, totals, invoice lines and approval evidence.

Every generation creates a financeExports record and an invoice audit event before the browser downloads the file. Repeated exports remain traceable. No network request is made to Coupa.

## Future live integration

A trusted backend can consume this canonical output and map it to the client's approved Coupa invoice API/import schema. The adapter must add secret management, idempotency, retry/dead-letter handling, response reconciliation and operational monitoring.
