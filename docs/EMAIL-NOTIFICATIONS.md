# Transactional email notifications

## Decision

Team JAM uses a Cloudflare Worker as the secure server-side boundary and Resend as the transactional email provider. The Resend API key is never available to the browser or committed to GitHub.

## Supported events

- Work order assigned or reassigned to a veterinary practice
- Work order accepted, declined or moved to a new treatment stage
- Invoice submitted for GAP review
- Invoice approved, rejected or returned to the practice

Firebase Authentication continues to send account verification and password-reset messages.

## Required Cloudflare secrets and variables

Set these in the Cloudflare project settings for both Preview and Production:

| Name | Purpose |
|---|---|
| `RESEND_API_KEY` | Secret Resend credential; never expose it to client code. |
| `EMAIL_FROM` | Sender, initially `GAP Emergency Portal <onboarding@resend.dev>`. |
| `EMAIL_TEST_RECIPIENT` | Safety override. While present, every message goes only to the verified test inbox. |
| `GAP_NOTIFICATION_EMAIL` | GAP operations/finance recipient. |
| `FIREBASE_API_KEY` | Firebase web API key used server-side to validate the caller's Firebase ID token. |

For this prototype, set both recipient variables to `aanayv@gmail.com`. Remove `EMAIL_TEST_RECIPIENT` only after a client-approved domain is verified in Resend and real-recipient testing is authorised.

## Security controls

1. The browser sends a current Firebase ID token with each request.
2. The Worker validates that token with Firebase before it contacts Resend.
3. The browser chooses only a supported event type and record context; subject and HTML templates are fixed on the server.
4. The Resend credential remains in Cloudflare's encrypted secret store.
5. Test mode redirects all delivery to the verified account and prevents accidental messages to real practices.
6. Emails contain no clinical attachment or sensitive greyhound treatment detail; recipients must sign in to view the record.

## Verification

Run `npm test`, `npm run lint`, and `npm run build`. Then sign in to the deployed portal and perform one supported workflow. Confirm the Worker returns HTTP 200, the message arrives at the test inbox, and Resend shows the delivery event in its Logs page.
