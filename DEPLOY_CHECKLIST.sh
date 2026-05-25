#!/bin/bash
# Production Deployment Quick Reference
# Usage: Review these commands before deploying

echo \"=== PanaDev Production Deployment Checklist ===\"
echo \"\"
echo \"Step 1: Generate Secrets\"
echo \"---\"
echo \"JWT_SECRET: $(openssl rand -hex 32)\"
echo \"ADMIN_PASSWORD: (create manually - min 16 chars)\"
echo \"\"

echo \"Step 2: Check for Hardcoded Secrets\"
echo \"---\"
grep -r \"panadev-default-secret\" . --exclude-dir=node_modules 2>/dev/null && echo \"❌ Found hardcoded secrets!\" || echo \"✅ No hardcoded secrets\"
grep -r \"PanaDev2026Admin\" . --exclude-dir=node_modules 2>/dev/null && echo \"❌ Found hardcoded password!\" || echo \"✅ No hardcoded passwords\"
echo \"\"

echo \"Step 3: Verify Build\"
echo \"---\"
echo \"npm run build\"
echo \"npm run lint\"
echo \"\"

echo \"Step 4: Environment Variables Needed\"
echo \"---\"
cat << 'EOF'
Required for production:
  JWT_SECRET               (generated)
  ADMIN_PASSWORD           (generated)
  FIREBASE_SERVICE_ACCOUNT (JSON string)
  NODE_ENV                 (set to 'production')

Optional but recommended:
  GEMINI_API_KEY           (for AI features)
  RESEND_API_KEY           (for email)
  APP_URL                  (your domain)
EOF
echo \"\"

echo \"Step 5: Test Locally with Production Settings\"
echo \"---\"
echo \"NODE_ENV=production JWT_SECRET=test ADMIN_PASSWORD=test npm run dev\"
echo \"Then open http://localhost:3000 and test:\"
echo \"  - Admin login\"
echo \"  - Google OAuth popup\"
echo \"  - Form submissions\"
echo \"\"

echo \"Step 6: Deploy\"
echo \"---\"
echo \"git push origin main\"
echo \"(Auto-deploys on Vercel/Render)\"
echo \"\"

echo \"Step 7: Post-Deployment Verification\"
echo \"---\"
echo \"curl https://your-domain.com/api/health\"
echo \"curl https://your-domain.com\"
echo \"\"

echo \"Step 8: Security Verification\"
echo \"---\"
echo \"✅ HTTPS enabled (look for 🔒 in browser)\"
echo \"✅ Admin login works\"
echo \"✅ Google OAuth works\"
echo \"✅ No console errors\"
echo \"✅ Check CSP headers (DevTools → Network → Response Headers)\"
echo \"\"

echo \"=== Security Fixes Applied ===\"
echo \"✅ Fail-fast secret validation\"
echo \"✅ CORS restricted to approved domains\"
echo \"✅ Strict security headers (CSP, HSTS)\"
echo \"✅ Request body size limited\"
echo \"✅ Input validation enhanced\"
echo \"✅ Error messages sanitized\"
echo \"✅ Production logging only\"
echo \"✅ Graceful shutdown handler\"
echo \"\"

echo \"=== Documentation Files ===\"
echo \"📄 PRODUCTION_DEPLOY.md    - Step-by-step guide\"
echo \"📄 DEPLOYMENT_SECURITY.md  - Full security checklist\"
echo \"📄 HARDENING_REPORT.md     - Before/after comparison\"
echo \"📄 SECURITY_SUMMARY.md     - Executive summary\"
echo \"\"

echo \"=== Deployment Platforms ===\"
echo \"Vercel:  https://vercel.com (recommended for Next.js-like apps)\"
echo \"Render:  https://render.com (good for Express.js)\"
echo \"Railway: https://railway.app (simple & fast)\"
echo \"\"

echo \"=== Support ===\"
echo \"Questions? Check PRODUCTION_DEPLOY.md for troubleshooting\"
echo \"Security issues? Contact: security@panadev.co.zw\"
