# Security Removal & Rotation Steps

This project contained committed secrets which have been removed from the working tree. Follow these steps to fully remove secrets from history and rotate compromised credentials.

1) Immediately rotate any compromised credentials (Firebase service account, API keys, email keys).
   - For Firebase: recreate a new service account in the console and generate a new JSON key.
   - For Resend / Gemini / other API keys: revoke the old key and create a new one.

2) Remove the files from the git history (recommended approaches):

   Using BFG Repo-Cleaner (recommended):

   ```bash
   # Install BFG (https://rtyley.github.io/bfg-repo-cleaner/)
   java -jar bfg.jar --delete-files serviceAccountKey.json
   java -jar bfg.jar --delete-files ".env"
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push --force
   ```

   Or using git filter-repo (modern, faster):

   ```bash
   pip install git-filter-repo
   git filter-repo --invert-paths --path serviceAccountKey.json --path .env
   git push --force
   ```

   Or manually (less ideal):

   ```bash
   git rm --cached serviceAccountKey.json .env
   git commit -m "Remove sensitive files"
   git push
   ```

3) Ensure secrets are stored in environment variables or a secrets manager in production.
   - Vercel/Netlify/Render: use the project dashboard "Environment Variables" to set keys.
   - For Docker/Kubernetes: use secret objects, not committed files.

4) Add protections to prevent future leaks:
   - Add `serviceAccountKey.json` and `.env*` to `.gitignore` (already present).
   - Add a pre-commit hook or use `git-secrets` to scan for API keys.
   - Use a secret scanning service (GitHub secret scanning, or third-party tools).

5) Verify after rotation:
   - Update deployment env vars with new keys and restart services.
   - Confirm that old keys are revoked and no longer valid.

If you want, I can run the git-history removal commands locally (requires your permission) or prepare a script you can run securely on your machine. I can also create a secure example showing how to load a Firebase service account from an environment variable instead of a checked-in file.
