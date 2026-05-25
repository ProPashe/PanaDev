# Deployment Security Hardening Checklist

## 🔴 Critical Issues Fixed

### 1. Hardcoded Secrets
- **Before**: `JWT_SECRET` and `ADMIN_PASSWORD` had default values
- **Fixed**: Now require env vars in production (fails fast)
- **Action**: Set in production environment:
  ```
  JWT_SECRET=<random-64-char-string>
  ADMIN_PASSWORD=<strong-password>
  ```

### 2. CORS Security
- **Before**: `cors()` allows all origins
- **Fixed**: Restricts to approved domains in production
- **Domains**: Add your domain to `DEPLOYMENT_SECURITY.md` after deploying

### 3. Helmet Headers
- **Before**: CSP disabled, basic protection only
- **Fixed**: Strict CSP and HSTS enabled in production
- **Impact**: Prevents XSS, clickjacking, and man-in-the-middle attacks

### 4. Request Body Limits
- **Before**: No size limit (abuse vector)
- **Fixed**: Limited to 1MB per request
- **Impact**: Prevents DoS through large payloads

### 5. Error Disclosure
- **Before**: Full error objects logged in production
- **Fixed**: Errors sanitized, details hidden from clients
- **Impact**: Prevents info leakage through error messages

### 6. Input Validation
- **Before**: Admin password accepted without validation
- **Fixed**: Type check, length limit (100 chars max)
- **Impact**: Prevents buffer overflow and injection attacks

---

## 🟡 Medium Priority Issues - Required for Production

### 7. Firebase Credentials in Git
- **Issue**: `.env` file contains public Firebase keys
- **Fix**: Add to `.gitignore`:
  ```
  .env
  .env.local
  serviceAccountKey.json
  ```
- **Action**: Run `git rm --cached .env serviceAccountKey.json` after adding to gitignore

### 8. Logging in Production
- **Issue**: `console.log` statements leak info
- **Fixed**: Conditional logging (dev only)
- **Impact**: Cleaner production logs

### 9. Graceful Shutdown
- **Action**: Added SIGTERM handler for clean server shutdown
- **Impact**: Prevents connection drops on deployment

### 10. Rate Limiting
- **Status**: Already implemented
- **Form submissions**: 10 per 15 minutes
- **AI requests**: 20 per minute
- **Check**: Verify limits meet your traffic needs

---

## 🟢 Before Deploying to Production

### Environment Variables Required
```bash
# Authentication
JWT_SECRET=<generate: openssl rand -hex 32>
ADMIN_PASSWORD=<strong-password-change-me>

# Firebase
FIREBASE_SERVICE_ACCOUNT=<JSON-stringified-service-account-key>

# External APIs
GEMINI_API_KEY=<your-google-gemini-api-key>
RESEND_API_KEY=<your-resend-email-api-key>

# Deployment
NODE_ENV=production
APP_URL=https://your-domain.com
```

### DNS & HTTPS
- [ ] HTTPS certificate installed
- [ ] Add `HSTS` preload header (already configured)
- [ ] Redirect HTTP → HTTPS at server level

### API Security
- [ ] Review all endpoints for injection vulnerabilities
- [ ] Add request logging for audit trail
- [ ] Set up monitoring/alerting for failed auth attempts

### Database Security
- [ ] Firestore rules restrict admin-only collections
- [ ] Backups enabled in Firebase
- [ ] IP whitelisting (if applicable)

### Third-Party Services
- [ ] API keys rotated and stored securely
- [ ] Rate limits match your expected traffic
- [ ] Fallback handlers for service failures

---

## 📋 Post-Deployment Checklist

- [ ] Monitor error logs for security issues
- [ ] Test password reset and admin access
- [ ] Verify HTTPS works on all pages
- [ ] Check CSP headers with browser DevTools
- [ ] Load test rate limiting
- [ ] Review Firebase security rules
- [ ] Set up log aggregation (Sentry/LogRocket)
- [ ] Enable 2FA for admin accounts if possible

---

## 🔐 Additional Recommendations

### Future Enhancements
1. **Bcrypt Passwords**: Replace plain-text password comparison
   ```typescript
   import bcrypt from 'bcrypt';
   const hashedPassword = await bcrypt.hash(password, 10);
   ```

2. **OAuth for Admin**: Use Google/GitHub instead of password
   ```typescript
   // Leverage Firebase auth for admin, not custom password
   ```

3. **Audit Logging**: Track all admin actions
   ```typescript
   await db.collection('audit_logs').add({
     action, userId, timestamp, ipAddress
   });
   ```

4. **Database Encryption**: Enable field-level encryption
   ```typescript
   // Firebase Datastore encryption at rest (default)
   ```

5. **Monitoring**: Integrate APM (Application Performance Monitoring)
   - New Relic, Datadog, or similar

---

## 📞 Support

For security vulnerabilities, email: `security@panadev.co.zw`

**Last Updated**: 2026-05-25
