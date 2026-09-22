# Finance-system invoice export

TJ-110 demonstrates that an approved GAP invoice can be transformed into a traceable finance-system payload. The project does not have a Coupa API or claim live Coupa connectivity.

## JSON output

The canonical JSON document includes:

- a schema version, source system and unique external reference;
- supplier number and veterinary-practice name;
- supplier invoice number, dates, currency and work-order reference;
- line-level quantity, price, tax and totals;
- GAP approval identity, timestamp and comment.

## CSV output

The CSV contains one row per invoice line and repeats the invoice and supplier references required for import or mapping. Text values are quoted and embedded quotes are escaped.

## Auditability

Every generated file creates a `financeExports` record and an invoice audit event. The invoice moves to `Exported`, but no data is transmitted to an external system.
