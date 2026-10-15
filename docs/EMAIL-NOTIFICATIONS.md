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

## Local setup for every team member

Do not ask another team member to send their Resend API key. Each developer should create a separate sending-only key so it can be revoked independently without disrupting anyone else.

1. Create or sign in to a free Resend account using the inbox that will receive test messages.
2. In **API Keys**, create a key named `GAP local - <your name>` with **Sending access** only. Copy it immediately; Resend only displays the complete token once.
3. At the repository root, run:

   ```bash
   cp .dev.vars.example .dev.vars
   ```

4. Edit `.dev.vars`:

   ```dotenv
   RESEND_API_KEY=re_your_own_key
   EMAIL_FROM="GAP Emergency Portal <onboarding@resend.dev>"
   EMAIL_TEST_RECIPIENT=the_email_used_for_your_resend_account
   GAP_NOTIFICATION_EMAIL=the_email_used_for_your_resend_account
   FIREBASE_API_KEY=AIzaSyBveIAfSFi29HiKaF6zfYOoLPjKMdYtxWs
   ```

5. Run `pnpm check:email`. It must report that all required values are present.
6. Run `pnpm dev`, sign in, and perform an action that sends an email. With the Resend onboarding sender, delivery is intentionally restricted to the Resend account's own email address.
7. Confirm the email appears in the inbox and in Resend **Logs**.

The real `.dev.vars` file remains gitignored. Only `.dev.vars.example` is committed. If a key is ever exposed, revoke it in Resend and create a replacement.

The official Resend guidance for restricted API-key permissions is available at <https://resend.com/changelog/new-api-key-permissions>.

## Troubleshooting

- Run `pnpm check:email` before debugging application code.
- Open `http://localhost:<port>/api/notifications/email` in the browser. It returns only non-secret configuration status and lists missing variable names; it never returns values.
- A `503` response means local variables or a recipient are missing. The portal now displays this error instead of silently reporting success.
- A `401` response means the current Firebase login token could not be validated. Sign out, sign in again, and confirm `FIREBASE_API_KEY` matches `app/lib/firebase.ts`.
- A `502` response means Resend rejected the request or could not be reached. Check that the key has Sending access and inspect Resend Logs.
- `onboarding@resend.dev` can be used for safe account-owner testing. Sending to other recipients requires a verified sending domain and explicit project approval.

## Security controls

1. The browser sends a current Firebase ID token with each request.
2. The Worker validates that token with Firebase before it contacts Resend.
3. The browser chooses only a supported event type and record context; subject and HTML templates are fixed on the server.
4. The Resend credential remains in Cloudflare's encrypted secret store.
5. Test mode redirects all delivery to the verified account and prevents accidental messages to real practices.
6. Emails contain no clinical attachment or sensitive greyhound treatment detail; recipients must sign in to view the record.

## Verification

Run `pnpm check:email`, `pnpm test`, `pnpm lint`, and `pnpm build`. Then sign in to the portal and perform one supported workflow. Confirm the Worker returns HTTP 200, the portal reports successful delivery, the message arrives at the test inbox, and Resend shows the delivery event in its Logs page.
