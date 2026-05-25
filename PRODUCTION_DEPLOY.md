# 🚀 QUICK START: Production Deployment Checklist

## Before You Deploy

### Step 1: Generate Secrets (Run These Commands)
```bash
# Generate JWT_SECRET
JWT_SECRET=$(openssl rand -hex 32)
echo "JWT_SECRET=$JWT_SECRET"

# Create a strong ADMIN_PASSWORD
# (At least 16 characters, mix of upper/lower/numbers/symbols)
echo "ADMIN_PASSWORD=YourStrongPassword123!"
```

### Step 2: Collect Configuration
```bash
# 1. Firebase Service Account JSON
# Go to: Firebase Console → Project Settings → Service Accounts
# Download the JSON file, convert to string:
cat serviceAccountKey.json | jq -c . | xargs -I {} echo "FIREBASE_SERVICE_ACCOUNT='{}'"

# 2. API Keys
# - GEMINI_API_KEY: https://aistudio.google.com/app/apikey
# - RESEND_API_KEY: https://resend.com/api-keys

# 3. Your Domain
# APP_URL=https://your-domain.com
```

### Step 3: Deploy Platform Configuration

#### For Vercel
1. Go to Project Settings → Environment Variables
2. Add these variables for `production`:
   ```
   JWT_SECRET=<your-generated-value>
   ADMIN_PASSWORD=<your-password>
   FIREBASE_SERVICE_ACCOUNT=<service-account-json>
   GEMINI_API_KEY=<your-key>
   RESEND_API_KEY=<your-key>
   NODE_ENV=production
   APP_URL=https://your-domain.com
   ```

#### For Render/Railway
1. Go to Environment → Environment Variables
2. Add the same variables (copy-paste from Vercel)

#### For Docker/Self-Hosted
1. Create `.env.production`:
   ```bash
   cp .env .env.production
   # Edit .env.production with production values
   ```
2. Never commit `.env.production`

### Step 4: Pre-Deployment Tests
```bash
# 1. TypeScript check
npm run lint

# 2. Build
npm run build

# 3. Check for secrets in code
grep -r "panadev-default-secret" src/
grep -r "PanaDev2026Admin" src/

# If any found, update those hardcoded values!
```

### Step 5: Deploy
```bash
# Vercel
git push origin main
# (Auto-deploys)

# Render/Railway
# (Same - push to main)

# Docker
docker build -t panadev .
docker run -e JWT_SECRET=... -e ADMIN_PASSWORD=... -p 3000:3000 panadev
```

### Step 6: Post-Deployment Verification
```bash
# 1. Health check
curl https://your-domain.com/api/health

# 2. Test admin login
# Go to https://your-domain.com
# Click Sign In → Admin Passcode
# Enter your ADMIN_PASSWORD
# Should see "Signed in successfully"

# 3. Test Google OAuth
# Click Sign In → Continue with Google
# Verify Google login popup appears

# 4. Check HTTPS
# All pages should have 🔒 padlock in browser
```

---

## Critical Points

### ✅ Must Do
- [ ] Generate new JWT_SECRET (don't use default)
- [ ] Create strong ADMIN_PASSWORD (don't use default)
- [ ] Set NODE_ENV=production
- [ ] Add .env to .gitignore
- [ ] Add serviceAccountKey.json to .gitignore
- [ ] Verify HTTPS on all URLs
- [ ] Test admin login before announcing

### ❌ Never Do
- [ ] Commit .env file
- [ ] Use hardcoded defaults in production
- [ ] Skip the health check endpoint
- [ ] Deploy without testing
- [ ] Share secrets via git/email

---

## Security Headers Automatically Added

When you set `NODE_ENV=production`, the server automatically adds:
- ✅ X-Content-Type-Options: nosniff (prevents MIME sniffing)
- ✅ X-Frame-Options: DENY (prevents clickjacking)
- ✅ Strict-Transport-Security (HSTS) (forces HTTPS)
- ✅ X-XSS-Protection: 1; mode=block (prevents XSS)

No additional action needed!

---

## If Something Goes Wrong

### "Invalid admin password"
- Check that ADMIN_PASSWORD env var is set correctly
- Verify no extra spaces/quotes
- Re-deploy after fixing

### "JWT_SECRET not set"
- You forgot to add JWT_SECRET to environment variables
- Add it to your deployment platform

### "CORS error" in browser console
- Verify APP_URL is set to your domain
- Clear browser cache
- Check deployment logs

### "Firebase not connected"
- Check FIREBASE_SERVICE_ACCOUNT is valid JSON
- Verify it's not truncated
- Test locally with the same credentials

---

## Support

- **Email**: support@panadev.co.zw
- **Docs**: See HARDENING_REPORT.md and DEPLOYMENT_SECURITY.md
- **Issues**: Check deployment logs for detailed error messages

---

**Estimated Time**: 15-20 minutes to deploy  
**Last Updated**: 2026-05-25
