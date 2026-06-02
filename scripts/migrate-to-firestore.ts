import fs from "fs";
import path from "path";
import admin from "firebase-admin";

async function main() {
  // Load service account from env var or local file
  const env = process.env.FIREBASE_SERVICE_ACCOUNT;
  let serviceAccount: any = null;
  if (env) {
    try {
      serviceAccount = JSON.parse(env);
    } catch (err) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT env var:", err);
      process.exit(1);
    }
  } else {
    const p = path.join(process.cwd(), "serviceAccountKey.json");
    if (fs.existsSync(p)) {
      serviceAccount = JSON.parse(fs.readFileSync(p, "utf8"));
    }
  }

  if (!serviceAccount) {
    console.error("No Firebase service account found. Set FIREBASE_SERVICE_ACCOUNT or provide serviceAccountKey.json.");
    process.exit(1);
  }

  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  const db = admin.firestore();

  const dbJsonPath = path.join(process.cwd(), "db.json");
  if (!fs.existsSync(dbJsonPath)) {
    console.error("db.json not found in project root.");
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(dbJsonPath, "utf8"));
  const collections = Object.keys(data);
  console.log("Collections found in db.json:", collections.join(", "));

  for (const col of collections) {
    const items: any[] = Array.isArray(data[col]) ? data[col] : [];
    if (items.length === 0) continue;
    console.log(`Importing ${items.length} docs into '${col}'...`);
    for (const item of items) {
      try {
        if (item.id) {
          await db.collection(col).doc(String(item.id)).set(item, { merge: true });
        } else {
          await db.collection(col).add(item);
        }
      } catch (err) {
        console.error(`Failed to import item into ${col}:`, err);
      }
    }
  }

  console.log("Migration complete.");
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
