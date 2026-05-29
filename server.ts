import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";

import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { Resend } from "resend";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";

dotenv.config();

// ⚠️ FAIL FAST: Ensure critical env vars are set in production
if (process.env.NODE_ENV === "production") {
  if (!process.env.JWT_SECRET) {
    console.error("FATAL: Missing required env var: JWT_SECRET");
    process.exit(1);
  }
  if (!process.env.ADMIN_PASSWORD && !process.env.ADMIN_PASSWORD_HASH) {
    console.error("FATAL: Missing required env var: ADMIN_PASSWORD or ADMIN_PASSWORD_HASH");
    process.exit(1);
  }
}

import admin from "firebase-admin";

type Firestore = ReturnType<typeof admin.firestore>;
let dbFirestore: Firestore | null = null;

try {
  let serviceAccount;
  
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // For Vercel deployment: Read from Environment Variable
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // For Local development: Read from file
    const serviceAccountPath = path.join(process.cwd(), "serviceAccountKey.json");
    if (fs.existsSync(serviceAccountPath)) {
      serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    }
  }

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    dbFirestore = admin.firestore();
    if (process.env.NODE_ENV !== "production") console.log("Firebase Admin initialized");
  } else {
    if (process.env.NODE_ENV !== "production") console.warn("Firebase not configured");
  }
} catch (error) {
  console.error("Firebase init error");
  if (process.env.NODE_ENV !== "production") console.error(error);
}

// ─── Email (Resend) ──────────────────────────────────────────────────────────
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const ADMIN_EMAIL = "mudzimwapanashe123@gmail.com";

async function sendNotification(subject: string, html: string) {
  if (!resend) {
    console.log("⚠️  No RESEND_API_KEY configured. Email skipped:", subject);
    return;
  }
  try {
    await resend.emails.send({
      from: "PanaDev Notifications <onboarding@resend.dev>",
      to: ADMIN_EMAIL,
      subject,
      html
    });
    console.log("✉️  Email sent:", subject);
  } catch (err) {
    console.error("❌ Email error:", err);
  }
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const BASE_URL = process.env.APP_URL || "https://panadev.vercel.app";

app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === "production" ? true : false,
  hsts: { maxAge: 31536000, includeSubDomains: true }
}));

app.use(cors({
  origin: process.env.NODE_ENV === "production" 
    ? ["https://panadev.vercel.app", process.env.APP_URL].filter(Boolean)
    : true,
  credentials: true
}));

app.use(express.json({ limit: "1mb" }));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 submissions per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many submissions from this IP, please try again after 15 minutes." }
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 minute
  max: 20,                   // 20 AI requests/min
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "AI rate limit reached. Please wait before making more requests." }
});

// ─── Custom Cookie and Hashing Utilities ────────────────────────────────────────
function parseCookies(cookieHeader: string | undefined): { [key: string]: string } {
  const list: { [key: string]: string } = {};
  if (!cookieHeader) return list;
  cookieHeader.split(";").forEach(cookie => {
    const parts = cookie.split("=");
    list[parts.shift()!.trim()] = decodeURIComponent(parts.join("="));
  });
  return list;
}

function hashPassword(password: string): string {
  const salt = process.env.ADMIN_SALT || "panadev_secure_salt_2026";
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}

async function writeToLocalDb(colName: string, item: any, id?: string) {
  const dbPath = path.join(process.cwd(), "db.json");
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({}, null, 2), "utf8");
  }
  try {
    const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));
    if (!data[colName]) {
      data[colName] = [];
    }
    if (id) {
      const idx = data[colName].findIndex((x: any) => x.id === id);
      if (idx !== -1) {
        data[colName][idx] = { ...data[colName][idx], ...item, id };
      } else {
        data[colName].push({ ...item, id });
      }
    } else {
      data[colName].push(item);
    }
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error(`Error writing to local db.json for ${colName}:`, err);
    throw err;
  }
}

async function deleteFromLocalDb(colName: string, id: string) {
  const dbPath = path.join(process.cwd(), "db.json");
  if (!fs.existsSync(dbPath)) return;
  try {
    const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));
    if (data[colName]) {
      data[colName] = data[colName].filter((x: any) => x.id !== id);
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf8");
    }
  } catch (err) {
    console.error(`Error deleting from local db.json for ${colName}:`, err);
    throw err;
  }
}

async function updateLocalDbStatus(colName: string, id: string, status: string) {
  const dbPath = path.join(process.cwd(), "db.json");
  if (!fs.existsSync(dbPath)) return;
  try {
    const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));
    if (data[colName]) {
      const idx = data[colName].findIndex((x: any) => x.id === id);
      if (idx !== -1) {
        data[colName][idx].status = status;
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf8");
      }
    }
  } catch (err) {
    console.error(`Error updating local db.json for ${colName}:`, err);
    throw err;
  }
}

// ─── Custom JWT Utilities ──────────────────────────────────────────────────────
type UserRole = "admin" | "editor" | "viewer";

interface TokenPayload {
  role: UserRole;
  email: string;
  name: string;
  exp?: number;
}

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === "production" ? "" : "dev-secret");
if (!JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET required in production");
}

function signToken(payload: object): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payloadStr = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 })).toString("base64url");
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${payloadStr}`).digest("base64url");
  return `${header}.${payloadStr}.${signature}`;
}

function verifyToken(token: string): TokenPayload | null {
  try {
    const [headerB64, payloadB64, signature] = token.split(".");
    if (!headerB64 || !payloadB64 || !signature) return null;
    const expectedSignature = crypto.createHmac("sha256", JWT_SECRET).update(`${headerB64}.${payloadB64}`).digest("base64url");
    if (signature !== expectedSignature) return null;
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return payload as TokenPayload;
  } catch (err) {
    return null;
  }
}

function verifyRole(...allowedRoles: UserRole[]) {
  return async (req: any, res: any, next: any) => {
    const cookies = parseCookies(req.headers.cookie);
    let token = cookies["admin_token"];

    // Fallback to Bearer token for developer ease
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.split("Bearer ")[1];
      }
    }

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided." });
    }

    const customUser = verifyToken(token);
    if (!customUser) {
      return res.status(401).json({ error: "Unauthorized: Invalid or expired token." });
    }

    if (!allowedRoles.includes(customUser.role)) {
      return res.status(403).json({ error: "Forbidden: Insufficient role privileges." });
    }

    req.adminUser = customUser;
    next();
  };
}

const verifyAdmin = verifyRole("admin");
const verifyEditor = verifyRole("admin", "editor");
const verifyViewer = verifyRole("admin", "editor", "viewer");

// Initialize Gemini API Client lazily
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY || "";
    // If no key is set, we will still instantiate and use fallbacks gracefully
    aiClient = new GoogleGenAI({ apiKey: key || "STUB" });
  }
  return aiClient;
}

// Helper to fetch collection
async function fetchCollection(colName: string) {
  if (!dbFirestore) {
    const dbPath = path.join(process.cwd(), "db.json");
    if (fs.existsSync(dbPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));
        return data[colName] || [];
      } catch (err) {
        console.error(`Error reading ${colName} from db.json fallback:`, err);
      }
    }
    return [];
  }
  const snapshot = await dbFirestore.collection(colName).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

app.post("/api/admin-login", formLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Email and password required." });
  }

  const expectedEmail = process.env.ADMIN_EMAIL || "mudzimwapanashe123@gmail.com";
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const expectedPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (email.toLowerCase() !== expectedEmail.toLowerCase()) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  let isMatch = false;
  if (expectedPasswordHash) {
    isMatch = hashPassword(password) === expectedPasswordHash;
  } else if (expectedPassword) {
    isMatch = password === expectedPassword;
  } else {
    return res.status(500).json({ error: "Admin login is not configured on the server." });
  }

  if (!isMatch) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const allowedRoles: UserRole[] = ["admin", "editor", "viewer"];
  const envRole = (process.env.ADMIN_ROLE || "admin").toLowerCase();
  const userRole = allowedRoles.includes(envRole as UserRole) ? (envRole as UserRole) : "admin";
  const token = signToken({ role: userRole, email: expectedEmail, name: "Panashe Mudzimwa (Admin)" });

  res.cookie("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.json({
    success: true,
    token,
    user: {
      name: "Panashe Mudzimwa (Admin)",
      email: expectedEmail,
      role: userRole
    }
  });
});

app.get("/api/check-auth", async (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["admin_token"];

  if (!token) {
    return res.status(401).json({ success: false, error: "Unauthorized: No active session." });
  }

  const customUser = verifyToken(token);
  if (!customUser) {
    return res.status(401).json({ success: false, error: "Unauthorized: Invalid or expired session." });
  }

  res.json({
    success: true,
    token,
    user: customUser
  });
});

app.post("/api/admin-logout", (req, res) => {
  res.clearCookie("admin_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });
  res.json({ success: true, message: "Logged out successfully." });
});

app.get("/api/data", verifyAdmin, async (req, res) => {
  const [bookings, feedbacks, sponsorships] = await Promise.all([
    fetchCollection("bookings"),
    fetchCollection("feedbacks"),
    fetchCollection("sponsorships")
  ]);
  res.json({ bookings, feedbacks, sponsorships });
});

// Site Content GET (public — pages read their text from here)
app.get("/api/site-content", async (req, res) => {
  try {
    const dbPath = path.join(process.cwd(), "db.json");
    if (!fs.existsSync(dbPath)) return res.json({});
    const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));
    res.json(data.siteContent || {});
  } catch {
    res.json({});
  }
});

// Site Content PUT (admin/editor — saves editable text blocks)
app.put("/api/site-content", verifyEditor, async (req, res) => {
  try {
    const dbPath = path.join(process.cwd(), "db.json");
    const data = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, "utf8")) : {};
    data.siteContent = { ...(data.siteContent || {}), ...req.body, updatedAt: new Date().toISOString() };
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf8");
    res.json({ success: true, content: data.siteContent });
  } catch (err) {
    res.status(500).json({ error: "Failed to save site content" });
  }
});

// App Projects GET (public)
app.get("/api/projects", async (req, res) => {
  res.json(await fetchCollection("projects"));
});

// App Projects POST (admin/editor only)
app.post("/api/projects", formLimiter, verifyEditor, async (req, res) => {
  const { id, title, description, fullDescription, tags, deployedUrl, githubUrl, category, status } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: "Missing required project fields" });
  }

  const newProject = {
    title,
    description,
    fullDescription: fullDescription || "",
    tags: tags || [],
    deployedUrl: deployedUrl || "",
    githubUrl: githubUrl || "",
    category: category || "Web Application",
    status: status || "Completed",
    order: req.body.order || Number(new Date()),
    metrics: req.body.metrics || { stars: 0, downloads: "0", users: "0" },
    createdAt: new Date().toISOString()
  };

  if (!dbFirestore) {
    try {
      const projId = id || `p-${Math.random().toString(36).substring(2, 9)}`;
      const projectWithId = { ...newProject, id: projId };
      await writeToLocalDb("projects", projectWithId, projId);
      return res.status(201).json({ success: true, project: projectWithId });
    } catch (err) {
      return res.status(500).json({ error: "Failed to write project locally" });
    }
  }

  try {
    let docRef;
    if (id) {
      docRef = dbFirestore.collection("projects").doc(id);
      await docRef.set(newProject);
      (newProject as any).id = id;
    } else {
      docRef = await dbFirestore.collection("projects").add(newProject);
      (newProject as any).id = docRef.id;
    }
    res.status(201).json({ success: true, project: newProject });
  } catch (err) {
    res.status(500).json({ error: "Failed to create project" });
  }
});

// App Projects UPDATE (admin/editor only)
app.put("/api/projects/:id", verifyEditor, async (req, res) => {
  const updateFields = { ...req.body, updatedAt: new Date().toISOString() };
  if (!dbFirestore) {
    try {
      await writeToLocalDb("projects", updateFields, req.params.id);
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Failed to update project locally" });
    }
  }
  try {
    await dbFirestore.collection("projects").doc(req.params.id).update(updateFields);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update project" });
  }
});

// App Feedbacks GET (public)
app.get("/api/feedback", async (req, res) => {
  res.json(await fetchCollection("feedbacks"));
});

// App Bookings GET (admin/editor/viewer)
app.get("/api/bookings", verifyViewer, async (req, res) => {
  res.json(await fetchCollection("bookings"));
});

// App Sponsorships GET (admin/editor/viewer)
app.get("/api/sponsorships", verifyViewer, async (req, res) => {
  res.json(await fetchCollection("sponsorships"));
});

// App Bookings Add
app.post("/api/bookings", formLimiter, async (req, res) => {
  const { clientName, clientEmail, companyName, date, timeSlot, projectType, description, budget } = req.body;
  if (!clientName || !clientEmail || !date || !timeSlot || !description) {
    return res.status(400).json({ error: "Missing required booking factors" });
  }

  const newBooking = {
    clientName,
    clientEmail,
    companyName: companyName || "",
    date,
    timeSlot,
    projectType,
    description,
    budget: budget || "",
    createdAt: new Date().toISOString()
  };

  if (dbFirestore) {
    const docRef = await dbFirestore.collection("bookings").add(newBooking);
    (newBooking as any).id = docRef.id;
  } else {
    const bkId = `b-${Math.random().toString(36).substring(2, 9)}`;
    (newBooking as any).id = bkId;
    await writeToLocalDb("bookings", newBooking, bkId);
  }

  sendNotification(
    `📅 New Booking from ${clientName}`,
    `<h2 style="color:#059669">New Consultation Booking</h2>
     <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
       <tr><td style="padding:6px 12px;font-weight:bold">Client</td><td style="padding:6px 12px">${clientName} &lt;${clientEmail}&gt;</td></tr>
       <tr><td style="padding:6px 12px;font-weight:bold">Company</td><td style="padding:6px 12px">${companyName || "N/A"}</td></tr>
       <tr><td style="padding:6px 12px;font-weight:bold">Date</td><td style="padding:6px 12px">${date} @ ${timeSlot}</td></tr>
       <tr><td style="padding:6px 12px;font-weight:bold">Type</td><td style="padding:6px 12px">${projectType}</td></tr>
       <tr><td style="padding:6px 12px;font-weight:bold">Budget</td><td style="padding:6px 12px">${budget || "Not specified"}</td></tr>
       <tr><td style="padding:6px 12px;font-weight:bold;vertical-align:top">Details</td><td style="padding:6px 12px">${description}</td></tr>
     </table>`
  );
  res.status(201).json({ success: true, booking: newBooking });
});

// Client Reviews Add (Support BOTH endpoints)
app.post("/api/feedback", formLimiter, async (req, res) => {
  const { clientName, clientEmail, rating, projectId, comment } = req.body;
  if (!clientName || !clientEmail || !rating || !comment) {
    return res.status(400).json({ error: "Missing required feedback blocks" });
  }

  const newFeedback = {
    clientName,
    clientEmail,
    rating: parseInt(rating, 10),
    projectId: projectId || "",
    comment,
    createdAt: new Date().toISOString()
  };

  if (dbFirestore) {
    const docRef = await dbFirestore.collection("feedbacks").add(newFeedback);
    (newFeedback as any).id = docRef.id;
  } else {
    const fbId = `f-${Math.random().toString(36).substring(2, 9)}`;
    (newFeedback as any).id = fbId;
    await writeToLocalDb("feedbacks", newFeedback, fbId);
  }

  res.status(201).json({ success: true, feedback: newFeedback });
});

app.post("/api/feedbacks", formLimiter, async (req, res) => {
  const { clientName, clientEmail, rating, projectId, comment } = req.body;
  if (!clientName || !clientEmail || !rating || !comment) {
    return res.status(400).json({ error: "Missing required feedback blocks" });
  }

  const newFeedback = {
    clientName,
    clientEmail,
    rating: parseInt(rating, 10),
    projectId: projectId || "",
    comment,
    createdAt: new Date().toISOString()
  };

  if (dbFirestore) {
    const docRef = await dbFirestore.collection("feedbacks").add(newFeedback);
    (newFeedback as any).id = docRef.id;
  }

  res.status(201).json({ success: true, feedback: newFeedback });
});

// Contacts Add
app.post("/api/contacts", formLimiter, async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required." });
  }

  if (dbFirestore) {
    await dbFirestore.collection("contacts").add({
      name, email, subject, message, createdAt: new Date().toISOString()
    });
  }

  sendNotification(
    `📬 Contact: ${subject || "New Inquiry"} from ${name}`,
    `<h2 style="color:#0ea5e9">New Contact Form Submission</h2>
     <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
       <tr><td style="padding:6px 12px;font-weight:bold">Name</td><td style="padding:6px 12px">${name}</td></tr>
       <tr><td style="padding:6px 12px;font-weight:bold">Email</td><td style="padding:6px 12px">${email}</td></tr>
       <tr><td style="padding:6px 12px;font-weight:bold">Subject</td><td style="padding:6px 12px">${subject || "N/A"}</td></tr>
       <tr><td style="padding:6px 12px;font-weight:bold;vertical-align:top">Message</td><td style="padding:6px 12px">${message}</td></tr>
     </table>`
  );

  res.status(201).json({ success: true, message: "Message received. We will respond shortly." });
});

// Partner Sponsorship Pledge Add
app.post("/api/sponsorships", formLimiter, async (req, res) => {
  const { name, sponsorName, organization, companyName, amount, fundingAmount, website, sponsorEmail, email, phone, message } = req.body;

  const nameToUse = sponsorName || name;
  const orgToUse = companyName || organization;
  const amountToUse = fundingAmount || amount;
  const emailToUse = sponsorEmail || email;

  if (!nameToUse || !emailToUse) {
    return res.status(400).json({ error: "Missing required sponsorship properties" });
  }

  const newSponsor = {
    name: nameToUse,
    organization: orgToUse || "",
    email: emailToUse,
    phone: phone || "",
    amount: amountToUse ? parseInt(amountToUse, 10) : 0,
    website: website || "",
    message: message || "",
    createdAt: new Date().toISOString()
  };

  if (dbFirestore) {
    const docRef = await dbFirestore.collection("sponsorships").add(newSponsor);
    (newSponsor as any).id = docRef.id;
  }

  sendNotification(
    `🌟 New Sponsorship Inquiry: ${nameToUse}`,
    `<h2 style="color:#a855f7">New Sponsorship Inquiry</h2>
     <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
       <tr><td style="padding:6px 12px;font-weight:bold">Name</td><td style="padding:6px 12px">${nameToUse}</td></tr>
       <tr><td style="padding:6px 12px;font-weight:bold">Organization</td><td style="padding:6px 12px">${orgToUse || "N/A"}</td></tr>
       <tr><td style="padding:6px 12px;font-weight:bold">Email</td><td style="padding:6px 12px">${emailToUse}</td></tr>
       <tr><td style="padding:6px 12px;font-weight:bold">Phone</td><td style="padding:6px 12px">${phone || "N/A"}</td></tr>
       <tr><td style="padding:6px 12px;font-weight:bold">Amount</td><td style="padding:6px 12px">$${amountToUse}</td></tr>
       <tr><td style="padding:6px 12px;font-weight:bold">Website</td><td style="padding:6px 12px">${website || "N/A"}</td></tr>
       <tr><td style="padding:6px 12px;font-weight:bold;vertical-align:top">Message</td><td style="padding:6px 12px">${message || "N/A"}</td></tr>
     </table>`
  );
  res.status(201).json(newSponsor);
});

// Contacts GET (admin only)
app.get("/api/contacts", verifyAdmin, async (req, res) => {
  res.json(await fetchCollection("contacts"));
});

// --- Export endpoints (admin only) - stream CSV with optional date filters ---
function csvEscape(v: any) {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

function parseDateFilter(range: string | undefined, from?: string | undefined, to?: string | undefined) {
  if (from) {
    const f = new Date(from);
    if (!isNaN(f.getTime())) return { from: f, to: to ? new Date(to) : null };
  }
  if (!range || range === "all") return { from: null, to: null };
  const days = Number(range || 0);
  if (!days || isNaN(days)) return { from: null, to: null };
  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setDate(toDate.getDate() - days);
  return { from: fromDate, to: toDate };
}

app.get("/api/export/bookings", verifyAdmin, async (req, res) => {
  try {
    const range = (req.query.range as string) || (req.query.r as string) || "all";
    const { from, to } = parseDateFilter(range, req.query.from as string, req.query.to as string);
    const page = req.query.page ? Number(req.query.page) : null;
    const limit = req.query.limit ? Number(req.query.limit) : null;
    const compress = (req.query.compress as string) || (req.query.c as string) || null; // 'gzip' or 'zip'

    const items = await fetchCollection("bookings");

    const filtered = items.filter((b: any) => {
      if (!from) return true;
      const raw = b.createdAt || b.date || "";
      const dt = new Date(raw);
      if (isNaN(dt.getTime())) return true;
      if (to) return dt >= from && dt <= to;
      return dt >= from;
    });

    const filenameBase = `bookings_${new Date().toISOString().split("T")[0]}`;
    const csvFilename = `${filenameBase}.csv`;
    const gzipFilename = `${filenameBase}.csv.gz`;

    const headers = ["id","clientName","clientEmail","companyName","date","timeSlot","projectType","description","createdAt","status","budget"];

    // Helper to write CSV rows to a writable stream with backpressure handling
    async function writeRowsTo(writable: any, rows: any[]) {
      writable.write(headers.join(",") + "\n");
      for (const r of rows) {
        const row = headers.map(h => csvEscape((r as any)[h] ?? "")).join(",") + "\n";
        if (!writable.write(row)) {
          await new Promise(rp => writable.once("drain", rp));
        }
      }
    }

    // Pagination support: if page+limit provided, slice accordingly
    let toStream = filtered;
    if (page && limit) {
      const start = (page - 1) * limit;
      toStream = filtered.slice(start, start + limit);
    }

    if (compress === "gzip") {
      const zlib = require("zlib");
      const gzip = zlib.createGzip();
      res.setHeader("Content-Type", "application/gzip");
      res.setHeader("Content-Disposition", `attachment; filename="${gzipFilename}"`);
      gzip.pipe(res);
      await writeRowsTo(gzip, toStream);
      gzip.end();
      return;
    }

    if (compress === "zip") {
      let archiver: any;
      try {
        archiver = require("archiver");
      } catch (e) {
        return res.status(501).json({ error: "ZIP streaming requires 'archiver' package. Install with: npm install archiver" });
      }
      const stream = require("stream").PassThrough();
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="${filenameBase}.zip"`);
      const archive = archiver("zip", { zlib: { level: 6 } });
      archive.pipe(res);
      archive.append(stream, { name: csvFilename });
      // start writing rows into the passthrough stream
      await writeRowsTo(stream, toStream);
      stream.end();
      await archive.finalize();
      return;
    }

    // Default: plain CSV
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${csvFilename}"`);
    await writeRowsTo(res, toStream);
    res.end();
  } catch (err) {
    console.error("Export bookings error:", err);
    res.status(500).json({ error: "Failed to export bookings" });
  }
});

app.get("/api/export/projects", verifyAdmin, async (req, res) => {
  try {
    const range = (req.query.range as string) || (req.query.r as string) || "all";
    const { from, to } = parseDateFilter(range, req.query.from as string, req.query.to as string);
    const page = req.query.page ? Number(req.query.page) : null;
    const limit = req.query.limit ? Number(req.query.limit) : null;
    const compress = (req.query.compress as string) || (req.query.c as string) || null;

    const items = await fetchCollection("projects");

    const filtered = items.filter((p: any) => {
      if (!from) return true;
      const raw = p.createdAt || "";
      const dt = new Date(raw);
      if (isNaN(dt.getTime())) return true;
      if (to) return dt >= from && dt <= to;
      return dt >= from;
    });

    const filenameBase = `projects_${new Date().toISOString().split("T")[0]}`;
    const csvFilename = `${filenameBase}.csv`;

    const headers = ["id","title","description","category","status","deployedUrl","githubUrl","tags","createdAt"];

    async function writeRowsTo(writable: any, rows: any[]) {
      writable.write(headers.join(",") + "\n");
      for (const r of rows) {
        const rowVals = headers.map(h => {
          if (h === "tags") {
            const tags = Array.isArray(r.tags) ? r.tags.join(";") : (r.tags || "");
            return csvEscape(tags);
          }
          return csvEscape((r as any)[h] ?? "");
        }).join(",") + "\n";
        if (!writable.write(rowVals)) {
          await new Promise(rp => writable.once("drain", rp));
        }
      }
    }

    let toStream = filtered;
    if (page && limit) {
      const start = (page - 1) * limit;
      toStream = filtered.slice(start, start + limit);
    }

    if (compress === "gzip") {
      const zlib = require("zlib");
      const gzip = zlib.createGzip();
      res.setHeader("Content-Type", "application/gzip");
      res.setHeader("Content-Disposition", `attachment; filename="${filenameBase}.csv.gz"`);
      gzip.pipe(res);
      await writeRowsTo(gzip, toStream);
      gzip.end();
      return;
    }

    if (compress === "zip") {
      let archiver: any;
      try {
        archiver = require("archiver");
      } catch (e) {
        return res.status(501).json({ error: "ZIP streaming requires 'archiver' package. Install with: npm install archiver" });
      }
      const stream = require("stream").PassThrough();
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="${filenameBase}.zip"`);
      const archive = archiver("zip", { zlib: { level: 6 } });
      archive.pipe(res);
      archive.append(stream, { name: csvFilename });
      await writeRowsTo(stream, toStream);
      stream.end();
      await archive.finalize();
      return;
    }

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${csvFilename}"`);
    await writeRowsTo(res, toStream);
    res.end();
  } catch (err) {
    console.error("Export projects error:", err);
    res.status(500).json({ error: "Failed to export projects" });
  }
});

app.get("/api/export/contacts", verifyAdmin, async (req, res) => {
  try {
    const range = (req.query.range as string) || (req.query.r as string) || "all";
    const { from, to } = parseDateFilter(range, req.query.from as string, req.query.to as string);
    const page = req.query.page ? Number(req.query.page) : null;
    const limit = req.query.limit ? Number(req.query.limit) : null;
    const compress = (req.query.compress as string) || (req.query.c as string) || null;

    const items = await fetchCollection("contacts");

    const filtered = items.filter((c: any) => {
      if (!from) return true;
      const raw = c.createdAt || "";
      const dt = new Date(raw);
      if (isNaN(dt.getTime())) return true;
      if (to) return dt >= from && dt <= to;
      return dt >= from;
    });

    const filenameBase = `contacts_${new Date().toISOString().split("T")[0]}`;
    const csvFilename = `${filenameBase}.csv`;

    const headers = ["id","name","email","phone","company","message","createdAt"];

    async function writeRowsTo(writable: any, rows: any[]) {
      writable.write(headers.join(",") + "\n");
      for (const r of rows) {
        const row = headers.map(h => csvEscape((r as any)[h] ?? "")).join(",") + "\n";
        if (!writable.write(row)) {
          await new Promise(rp => writable.once("drain", rp));
        }
      }
    }

    let toStream = filtered;
    if (page && limit) {
      const start = (page - 1) * limit;
      toStream = filtered.slice(start, start + limit);
    }

    if (compress === "gzip") {
      const zlib = require("zlib");
      const gzip = zlib.createGzip();
      res.setHeader("Content-Type", "application/gzip");
      res.setHeader("Content-Disposition", `attachment; filename="${filenameBase}.csv.gz"`);
      gzip.pipe(res);
      await writeRowsTo(gzip, toStream);
      gzip.end();
      return;
    }

    if (compress === "zip") {
      let archiver: any;
      try {
        archiver = require("archiver");
      } catch (e) {
        return res.status(501).json({ error: "ZIP streaming requires 'archiver' package. Install with: npm install archiver" });
      }
      const stream = require("stream").PassThrough();
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="${filenameBase}.zip"`);
      const archive = archiver("zip", { zlib: { level: 6 } });
      archive.pipe(res);
      archive.append(stream, { name: csvFilename });
      await writeRowsTo(stream, toStream);
      stream.end();
      await archive.finalize();
      return;
    }

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${csvFilename}"`);
    await writeRowsTo(res, toStream);
    res.end();
  } catch (err) {
    console.error("Export contacts error:", err);
    res.status(500).json({ error: "Failed to export contacts" });
  }
});

// Admin Project DELETE
app.delete("/api/projects/:id", verifyAdmin, async (req, res) => {
  if (!dbFirestore) {
    try {
      await deleteFromLocalDb("projects", req.params.id);
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Failed to delete project locally" });
    }
  }
  try {
    await dbFirestore.collection("projects").doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// Admin Feedback DELETE
app.delete("/api/feedback/:id", verifyAdmin, async (req, res) => {
  if (!dbFirestore) {
    try {
      await deleteFromLocalDb("feedbacks", req.params.id);
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Failed to delete feedback locally" });
    }
  }
  try {
    await dbFirestore.collection("feedbacks").doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete feedback" });
  }
});

// Admin Booking Status UPDATE
app.put("/api/bookings/:id", verifyAdmin, async (req, res) => {
  if (!dbFirestore) {
    try {
      await updateLocalDbStatus("bookings", req.params.id, req.body.status);
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Failed to update booking status locally" });
    }
  }
  try {
    await dbFirestore.collection("bookings").doc(req.params.id).update({ status: req.body.status });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update booking status" });
  }
});

// Admin Booking DELETE
app.delete("/api/bookings/:id", verifyAdmin, async (req, res) => {
  if (!dbFirestore) {
    try {
      await deleteFromLocalDb("bookings", req.params.id);
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Failed to delete booking locally" });
    }
  }
  try {
    await dbFirestore.collection("bookings").doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete booking" });
  }
});

// AI AI Risk Predictor Endpoint (Gemini Integration)
app.post("/api/ai/risk-predictor", aiLimiter, async (req, res) => {
  const { projectKey, currentStep } = req.body;
  const prompt = `You are a project manager auditing software sprint nodes. Analyze this project: '${projectKey}' at milestone step code: ${currentStep}/5. Give a JSON response containing 'delayRisk', 'estimatedDelivery', 'riskScore' and 'criticalObservations' properties. Keep text concise under 15 words per property. Output ONLY valid raw JSON without any markdown code blocks.`;

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("No Gemini API key configured.");

    const client = getGeminiClient();
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [prompt]
    });

    const val = response.text || "";
    // Sanitize any markdown markdown blocks if Google returns them
    const cleanJson = val.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanJson);
    res.json(parsed);
  } catch (err) {
    console.error("AI Error:", err);
    res.status(500).json({ error: "AI Risk Predictor failed to process the request." });
  }
});

// AI Chatbot Bot Endpoint
app.post("/api/ai/chat", aiLimiter, async (req, res) => {
  const { message, history } = req.body;
  const prompt = `You are the friendly development support desk assistant for PanaDev Apps agency (managed by our director Panashe Mudzimwa). Help this enterprise client with their question: "${message}". Give a highly concise human-like professional response under 60 words. Avoid complex technical jargon unless asked. Contact support details are: mudzimwapanashe123@gmail.com, Mobile: +263713058383 or +263788923630. Text only, no formatting markdown.`;

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("No Gemini API key configured.");

    const client = getGeminiClient();
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [prompt]
    });

    res.json({ reply: (response.text || "").trim() });
  } catch (err) {
    console.error("AI Error:", err);
    res.status(500).json({ error: "AI Chatbot failed to process the request." });
  }
});

// AI Proposal & Budget Architect
app.post("/api/ai/proposal-generator", aiLimiter, async (req, res) => {
  const { brief } = req.body;
  const prompt = `Convert this product description: "${brief}" into a full formal development contract proposal. Respond ONLY with a raw JSON format contains the keys 'scope', 'timeline', 'budgetRange', 'techStack' (array of strings) and 'riskMitigation'. Do not include any HTML markdown code blocks, backticks, or comments. Keep property explanations beneath 25 words.`;

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("No Gemini API key");

    const client = getGeminiClient();
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [prompt]
    });

    const val = response.text || "";
    const cleanJson = val.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanJson);
    res.json(parsed);
  } catch (err) {
    console.error("AI Error:", err);
    res.status(500).json({ error: "AI Proposal Generator failed to process the request." });
  }
});

// AI Website Auditor
app.post("/api/ai/site-auditor", aiLimiter, async (req, res) => {
  const { url } = req.body;
  const prompt = `Perform a high fidelity web design, performance, and SEO audit on this domain url: "${url}". Give a JSON response containing 'seoScore' (number 0-100), 'performanceScore' (number 0-100), 'securityScore' (number 0-100), 'uiChecklist' (array of 3 strings of recommended improvements), 'identifiedWeaknesses' (array of 2 strings), and 'suggestedKeywords' (array of 3 high-conversion strings). Keep bullet instructions under 10 words. Output ONLY raw valid JSON text without markdown blocks.`;

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("No Gemini key");

    const client = getGeminiClient();
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [prompt]
    });

    const val = response.text || "";
    const cleanJson = val.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanJson);
    res.json(parsed);
  } catch (err) {
    console.error("AI Error:", err);
    res.status(500).json({ error: "AI Site Auditor failed to process the request." });
  }
});

// AI Support Ticket Categorizer
app.post("/api/ai/ticket-categorizer", async (req, res) => {
  const { subject, issue } = req.body;
  const prompt = `Classify this support tick log request. Subject: "${subject}". Description: "${issue}". Return a single string category name from: ('Critical Bug', 'UI refinement', 'Billing Inquiry', 'Technical Setup'). Respond ONLY with the category name string, no other punctuation.`;

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("");

    const client = getGeminiClient();
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [prompt]
    });

    res.json({ category: (response.text || "Technical Setup").trim() });
  } catch (err) {
    const isBilling = issue.toLowerCase().includes("pay") || issue.toLowerCase().includes("budget") || subject.toLowerCase().includes("billing");
    res.json({ category: isBilling ? "Billing Inquiry" : "Technical Setup" });
  }
});

// AI SEO Description Optimizer
app.post("/api/ai/seo-optimizer", async (req, res) => {
  const { keyword } = req.body;
  const prompt = `Build premium SEO search credentials tags and meta description regarding focus keyword: "${keyword}". Return a raw JSON block containing 'title' (under 60 chars), 'description' (under 160 chars), 'tags' (comma-spaced string list), and 'blogSummary' (30 words blog conceptual summary). Output ONLY valid raw JSON text.`;

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("");

    const client = getGeminiClient();
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [prompt]
    });

    const val = response.text || "";
    const cleanJson = val.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanJson);
    res.json(parsed);
  } catch (err) {
    res.json({
      title: `Optimizing ${keyword} - High-Fidelity Tech Solutions | PanaDev`,
      description: `Discovers state-of-the-art designs, visual maps, and user dashboards regarding ${keyword}. Powered by PanaDev Apps for maximum enterprise performance.`,
      tags: `${keyword}, web systems, hire zimbabwe developer, react apps, node database`,
      blogSummary: `An analytical compilation guide explaining why corporate brands utilize lightweight ${keyword} frameworks to streamline operational costs and security checks.`
    });
  }
});

app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send(`User-agent: *\nAllow: /\nDisallow: /api/admin-login\nDisallow: /api/admin-logout\nDisallow: /api/bookings\nDisallow: /api/contacts\nDisallow: /api/feedbacks\nSitemap: ${BASE_URL}/sitemap.xml\nHost: ${BASE_URL.replace(/^https?:\/\//, "")}\n`);
});

app.get("/sitemap.xml", (req, res) => {
  res.type("application/xml");
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.00</priority>
  </url>
  <url>
    <loc>${BASE_URL}/projects</loc>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>${BASE_URL}/services</loc>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>
  </url>
  <url>
    <loc>${BASE_URL}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.70</priority>
  </url>
  <url>
    <loc>${BASE_URL}/booking</loc>
    <changefreq>monthly</changefreq>
    <priority>0.65</priority>
  </url>
  <url>
    <loc>${BASE_URL}/sponsorship</loc>
    <changefreq>monthly</changefreq>
    <priority>0.65</priority>
  </url>
  <url>
    <loc>${BASE_URL}/feedback</loc>
    <changefreq>monthly</changefreq>
    <priority>0.60</priority>
  </url>
</urlset>
`);
});

// Launch express server with Vite middleware support (local dev only)
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export the Express API for Vercel Serverless
export default app;

// Only start the server if not running in a serverless environment (Vercel)
if (!process.env.VERCEL) {
  startServer();
}
