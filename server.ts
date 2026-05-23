import express from "express";
import path from "path";
import fs from "fs";
import { createRequire } from "module";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { Resend } from "resend";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";

dotenv.config();

const require = createRequire(import.meta.url);
const admin = require("firebase-admin");

type Firestore = ReturnType<typeof admin.firestore>;
let dbFirestore: Firestore | null = null;

try {
  const serviceAccountPath = path.join(process.cwd(), "serviceAccountKey.json");
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    dbFirestore = admin.firestore();
    console.log("✅ Firebase Admin SDK initialized. Connected to Firestore: panadev-3069");
  } else {
    console.warn("⚠️  No serviceAccountKey.json found. Firebase features disabled.");
  }
} catch (error) {
  console.error("❌ Error initializing Firebase Admin SDK:", error);
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
const PORT = 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

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

// ─── Admin Auth Middleware ────────────────────────────────────────────────────
const ADMIN_UID = process.env.ADMIN_UID || "";

async function verifyAdmin(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided." });
  }
  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    // Allow if UID matches admin OR email matches admin email
    if (decoded.uid !== ADMIN_UID && decoded.email !== "mudzimwapanashe123@gmail.com") {
      return res.status(403).json({ error: "Forbidden: Admin access only." });
    }
    req.adminUser = decoded;
    next();
  } catch (err: any) {
    console.error("verifyAdmin Error:", err);
    return res.status(401).json({ error: `Unauthorized: ${err.message}` });
  }
}

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
  if (!dbFirestore) return [];
  const snapshot = await dbFirestore.collection(colName).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

app.get("/api/data", verifyAdmin, async (req, res) => {
  if (!dbFirestore) return res.json({ bookings: [], feedbacks: [], sponsorships: [] });
  const [bookings, feedbacks, sponsorships] = await Promise.all([
    fetchCollection("bookings"),
    fetchCollection("feedbacks"),
    fetchCollection("sponsorships")
  ]);
  res.json({ bookings, feedbacks, sponsorships });
});

// App Projects GET (public)
app.get("/api/projects", async (req, res) => {
  res.json(await fetchCollection("projects"));
});

// App Projects POST (admin only)
app.post("/api/projects", formLimiter, verifyAdmin, async (req, res) => {
  const { id, title, description, fullDescription, tags, deployedUrl, githubUrl, category, status } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: "Missing required project fields" });
  }

  const newProject = {
    // If user provided a specific slug/ID, we use it, otherwise Firestore auto-generates
    title,
    description,
    fullDescription: fullDescription || "",
    tags: tags || [],
    deployedUrl: deployedUrl || "",
    githubUrl: githubUrl || "",
    category: category || "Web Application",
    status: status || "Completed",
    metrics: req.body.metrics || { stars: 0, downloads: "0", users: "0" },
    createdAt: new Date().toISOString()
  };

  if (!dbFirestore) {
    return res.status(500).json({ error: "Database not connected" });
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
    res.status(201).json(newProject);
  } catch (err) {
    res.status(500).json({ error: "Failed to create project" });
  }
});

// App Feedbacks GET (public)
app.get("/api/feedback", async (req, res) => {
  res.json(await fetchCollection("feedbacks"));
});

// App Bookings GET (admin only)
app.get("/api/bookings", verifyAdmin, async (req, res) => {
  res.json(await fetchCollection("bookings"));
});

// App Sponsorships GET (admin only)
app.get("/api/sponsorships", verifyAdmin, async (req, res) => {
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
  res.status(201).json(newBooking);
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

// Admin Project DELETE
app.delete("/api/projects/:id", verifyAdmin, async (req, res) => {
  if (!dbFirestore) return res.status(500).json({ error: "Database not connected" });
  try {
    await dbFirestore.collection("projects").doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// Admin Feedback DELETE
app.delete("/api/feedback/:id", verifyAdmin, async (req, res) => {
  if (!dbFirestore) return res.status(500).json({ error: "Database not connected" });
  try {
    await dbFirestore.collection("feedbacks").doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete feedback" });
  }
});

// Admin Booking Status UPDATE
app.put("/api/bookings/:id", verifyAdmin, async (req, res) => {
  if (!dbFirestore) return res.status(500).json({ error: "Database not connected" });
  try {
    await dbFirestore.collection("bookings").doc(req.params.id).update({ status: req.body.status });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update booking status" });
  }
});

// Admin Booking DELETE
app.delete("/api/bookings/:id", verifyAdmin, async (req, res) => {
  if (!dbFirestore) return res.status(500).json({ error: "Database not connected" });
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



// Launch express server with Vite middleware support
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
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

startServer();
