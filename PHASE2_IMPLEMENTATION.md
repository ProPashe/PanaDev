# Implementation Guide: Phase 2 Security Enhancements

## 1. Bcrypt Password Hashing (HIGH PRIORITY)

### Why
- Current: Plain-text password comparison `password === expectedPassword`
- Risk: If .env is ever leaked, admin password is compromised immediately
- Solution: Hash passwords with bcrypt (industry standard)

### Implementation Steps

#### Step 1: Install Dependency
```bash
npm install bcrypt
npm install --save-dev @types/bcrypt
```

#### Step 2: Update server.ts - Setup

Replace this section in `server.ts`:
```typescript
// OLD CODE (current):
app.post("/api/admin-login", (req, res) => {
  const { password } = req.body;
  if (!password || typeof password !== "string" || password.length > 100) {
    return res.status(400).json({ error: "Invalid request" });
  }
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (password !== expectedPassword) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  // ... rest of login logic
});
```

With this:
```typescript
// NEW CODE:
import bcrypt from "bcrypt";

// At startup, hash the password once
let HASHED_ADMIN_PASSWORD: string | null = null;
if (process.env.ADMIN_PASSWORD) {
  // In production, this should be pre-hashed and stored in env
  // For now, hash on startup (takes ~100ms)
  bcrypt.hash(process.env.ADMIN_PASSWORD, 10, (err, hash) => {
    if (err) console.error("Bcrypt error:", err);
    else HASHED_ADMIN_PASSWORD = hash;
  });
}

app.post("/api/admin-login", async (req, res) => {
  const { password } = req.body;
  if (!password || typeof password !== "string" || password.length > 100) {
    return res.status(400).json({ error: "Invalid request" });
  }
  
  if (!HASHED_ADMIN_PASSWORD) {
    return res.status(500).json({ error: "Server error" });
  }
  
  // Compare plain password with hashed password
  const isValid = await bcrypt.compare(password, HASHED_ADMIN_PASSWORD);
  if (!isValid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  
  // ... rest of login logic (unchanged)
});
```

#### Step 3: Generate Hashed Password for Production

Run this once and save the output:
```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YourStrongPassword123', 10, (err, hash) => { console.log(hash); });"
```

Copy the output (looks like `$2b$10$...`) and use as ADMIN_PASSWORD env var.

#### Step 4: Test Locally
```bash
npm run dev
# Test admin login - should still work
```

**Benefit**: Even if .env is leaked, attacker can't use the hashed password directly.

---

## 2. Audit Logging (HIGH PRIORITY)

### Why
- Current: No record of who accessed what
- Risk: Can't track unauthorized access or admin abuse
- Solution: Log all sensitive actions to Firestore

### Implementation Steps

#### Step 1: Create Audit Logging Function

Add to `server.ts`:
```typescript
async function logAudit(action: string, details: any) {
  if (!dbFirestore) return;
  
  try {
    await dbFirestore.collection("audit_logs").add({
      action,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: details.ipAddress || "unknown",
      userId: details.userId || "system",
      success: details.success !== false
    });
  } catch (err) {
    console.error("Audit log failed:", err);
  }
}
```

#### Step 2: Log Admin Login

Update admin login endpoint:
```typescript
app.post("/api/admin-login", async (req, res) => {
  const { password } = req.body;
  // ... validation code ...
  
  const isValid = await bcrypt.compare(password, HASHED_ADMIN_PASSWORD);
  
  if (!isValid) {
    // Log failed attempt
    await logAudit("ADMIN_LOGIN_FAILED", {
      ipAddress: req.ip,
      success: false
    });
    return res.status(401).json({ error: "Invalid credentials" });
  }
  
  // Log successful login
  await logAudit("ADMIN_LOGIN_SUCCESS", {
    ipAddress: req.ip,
    userId: "admin",
    success: true
  });
  
  // ... return token ...
});
```

#### Step 3: Log Admin Actions

Add logging to sensitive endpoints:
```typescript
// Before deleting a project
app.delete("/api/projects/:id", verifyAdmin, async (req, res) => {
  // ... validation ...
  
  await logAudit("PROJECT_DELETED", {
    projectId: req.params.id,
    userId: req.adminUser.email,
    ipAddress: req.ip
  });
  
  await dbFirestore.collection("projects").doc(req.params.id).delete();
  res.json({ success: true });
});
```

#### Step 4: Create Admin Dashboard View

Add new endpoint to view audit logs:
```typescript
app.get("/api/audit-logs", verifyAdmin, async (req, res) => {
  if (!dbFirestore) return res.json([]);
  
  const snapshot = await dbFirestore
    .collection("audit_logs")
    .orderBy("timestamp", "desc")
    .limit(100)
    .get();
  
  const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(logs);
});
```

**Benefit**: Can see who did what, when, and from where.

---

## 3. OAuth for Admin (MEDIUM PRIORITY)

### Why
- Current: Single password for all admins, password-based auth
- Risk: One compromised password = full admin access
- Solution: Use Google OAuth (integrates with Firebase)

### Implementation Steps

#### Step 1: Update Firebase Web App Config

In `.env`:
```env
# Add this
VITE_FIREBASE_ALLOW_GOOGLE_AUTH=true
VITE_ADMIN_EMAIL=mudzimwapanashe123@gmail.com
```

#### Step 2: Update Admin Middleware

Replace password validation with email check:
```typescript
async function verifyAdmin(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  const idToken = authHeader.split("Bearer ")[1];
  
  try {
    // Verify Firebase ID token (Google OAuth token)
    const decoded = await admin.auth().verifyIdToken(idToken);
    
    // Check if user is authorized admin
    const adminEmail = process.env.VITE_ADMIN_EMAIL;
    if (decoded.email !== adminEmail) {
      return res.status(403).json({ error: "Not authorized" });
    }
    
    req.adminUser = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
```

#### Step 3: Remove Password Endpoint

Delete the `/api/admin-login` endpoint entirely.

#### Step 4: Update Frontend

In `src/App.tsx`, remove password login UI:
```typescript
// Remove this:
const [adminPassword, setAdminPassword] = useState("");

// Remove the password form from sign-in modal

// Keep only Google sign-in:
<button onClick={handleGoogleLogin}>
  Continue with Google
</button>
```

**Benefit**: No passwords to manage, single sign-on, easier to add more admins.

---

## 4. API Rate Limiting per User (MEDIUM PRIORITY)

### Why
- Current: IP-based rate limiting (shared between users on same network)
- Risk: Users behind corporate proxy can block each other
- Solution: Rate limit by user ID + IP combination

### Implementation Steps

#### Step 1: Install Redis Store

```bash
npm install rate-limit-redis redis
```

#### Step 2: Setup Redis Connection

Add to `server.ts`:
```typescript
import { createClient } from "redis";
import RedisStore from "rate-limit-redis";

const redisClient = createClient({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379")
});

redisClient.connect().catch(err => {
  console.warn("Redis not available, using in-memory rate limiting");
});
```

#### Step 3: Create User-Based Rate Limiter

```typescript
const userFormLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: "form-limit:"
  }),
  keyGenerator: (req) => {
    // Rate limit by: user email + IP
    const user = (req as any).user?.email || "anonymous";
    return `${user}:${req.ip}`;
  },
  windowMs: 15 * 60 * 1000,
  max: 50, // 50 per user per 15 mins
  message: { error: "Too many requests" }
});

app.post("/api/bookings", userFormLimiter, async (req, res) => {
  // ... booking logic ...
});
```

**Benefit**: Fair rate limiting, prevents abuse per user, not per IP.

---

## 5. Error Tracking (Sentry) (MEDIUM PRIORITY)

### Why
- Current: Errors only visible in server logs
- Risk: Production errors go unnoticed
- Solution: Automatic error tracking with Sentry

### Implementation Steps

#### Step 1: Install Sentry SDK

```bash
npm install @sentry/node @sentry/tracing
```

#### Step 2: Initialize Sentry

Add at very top of `server.ts` (before other code):
```typescript
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0
  });
}

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());
```

#### Step 3: Add Error Handler

Add before the listen call:
```typescript
app.use(Sentry.Handlers.errorHandler());

// Final catch-all error handler
app.use((err: any, req: any, res: any, next: any) => {
  Sentry.captureException(err);
  res.status(500).json({ error: "Internal server error" });
});
```

#### Step 4: Get Sentry DSN

1. Go to https://sentry.io
2. Create account and project
3. Copy DSN from project settings
4. Add to .env: `SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`

**Benefit**: Get email alerts when errors happen, see error trends.

---

## 6. Frontend Error Tracking (MEDIUM PRIORITY)

### Why
- Current: Frontend errors not tracked
- Risk: Users experience bugs silently
- Solution: Send frontend errors to Sentry

### Implementation Steps

#### Step 1: Install Sentry in React

```bash
npm install @sentry/react @sentry/tracing
```

#### Step 2: Initialize in `src/main.tsx`

```typescript
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 0.1
  });
}
```

#### Step 3: Wrap App Component

```typescript
const SentryApp = Sentry.withProfiler(App);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SentryApp />
  </React.StrictMode>
);
```

#### Step 4: Add to .env

```env
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

**Benefit**: Know when users experience errors, fix critical issues fast.

---

## 7. Database Field Encryption (LOW PRIORITY)

### Why
- Current: All data stored in plaintext in Firestore
- Risk: If Firestore compromised, sensitive data exposed
- Solution: Encrypt sensitive fields before storing

### Implementation Steps

#### Step 1: Install Encryption Library

```bash
npm install crypto-js
npm install --save-dev @types/crypto-js
```

#### Step 2: Create Encryption Utilities

Create `server/encrypt.ts`:
```typescript
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "change-me-in-production-min-32-chars";

export function encryptField(value: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(value, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

export function decryptField(encrypted: string): string {
  const [ivHex, encryptedHex] = encrypted.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
```

#### Step 3: Encrypt Sensitive Fields

```typescript
import { encryptField, decryptField } from "./encrypt";

// When storing email (sensitive)
const newBooking = {
  clientName,
  clientEmail: encryptField(clientEmail), // Encrypt email
  date,
  // ... rest
};

// When retrieving
const booking = await dbFirestore.collection("bookings").doc(id).get();
const data = booking.data();
const decryptedEmail = decryptField(data.clientEmail);
```

**Benefit**: Even if database is compromised, customer emails remain encrypted.

---

## Implementation Roadmap

### Week 1 (Priority 1)
- [ ] Bcrypt password hashing
- [ ] Audit logging

### Week 2 (Priority 2)
- [ ] OAuth for admin access
- [ ] Sentry error tracking
- [ ] User-based rate limiting

### Week 3+ (Priority 3)
- [ ] Database encryption
- [ ] Advanced monitoring

---

## Testing Checklist

After each implementation, test:
- [ ] Functionality still works
- [ ] No new console errors
- [ ] Performance not impacted
- [ ] Error handling works
- [ ] Data correctly stored/retrieved

---

## Support

For questions on implementation:
- Review code examples above
- Check official docs:
  - Bcrypt: https://github.com/kelektiv/node.bcrypt.js
  - Sentry: https://docs.sentry.io/
  - Firebase Admin: https://firebase.google.com/docs/admin/setup

---

**Last Updated**: 2026-05-25
