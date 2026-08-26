# Contributing (Team JAM)

This repo is the working GAP Emergency Veterinary Portal prototype. Jubayer pushed the initial `main` branch with the full app working end to end. Each teammate now brings their own feature area up to date on their own branch.

See [`CONTRIBUTION_INDEX.md`](CONTRIBUTION_INDEX.md) for who owns which files.

## If you were given a folder of files to add

1. Clone this repo:
   ```
   git clone <repo-url>
   cd gap-emergency-portal
   ```
2. Create a branch with your name:
   ```
   git checkout -b <yourname>/<short-description>
   ```
3. Copy the files from the folder you were given **into the repo at the same relative path** (e.g. a file at `app/features/auth/Auth.tsx` in your folder overwrites `app/features/auth/Auth.tsx` in the repo). Don't rename or move anything unless you mean to.
4. Install dependencies and run the app to check your part still works:
   ```
   npm install
   npm run dev
   ```
5. Review the file(s) — read through the code, understand what it does, and make any correction or improvement you think it needs. Don't just drop the file in unreviewed.
6. Commit and push, including the relevant Jira key(s) from `CONTRIBUTION_INDEX.md` in your commit message:
   ```
   git add <files>
   git commit -m "TJ-26 TJ-27 implement authentication and password recovery"
   git push -u origin <yourname>/<short-description>
   ```
7. Open a pull request back into `main` and ask for review.

## Notes

- `app/features/misc/*` (Incidents, Practices, Notifications, Reports, Audit Log, Users, Settings, Help) has no assigned owner yet — see `CONTRIBUTION_INDEX.md`.
- Coupa/Dynamics 365 integration is intentionally not implemented — see the README's "Prototype limitations".
