from pathlib import Path

path = Path('server.ts')
text = path.read_text(encoding='utf-8').replace('\r\n', '\n')

replacements = [
    (
        '<<<<<<< HEAD\n'
        '    if (!data[colName]) data[colName] = [];\n'
        '=======\n'
        '    if (!data[colName]) {\n'
        '      data[colName] = [];\n'
        '    }\n'
        '>>>>>>> merge/workspace-changes',
        '    if (!data[colName]) {\n'
        '      data[colName] = [];\n'
        '    }'
    ),
    (
        '<<<<<<< HEAD\n'
        '// ─── Public Admin Login & Health Endpoints ────────────────────────────────────\n'
        'app.get("/api/health", (req, res) => {\n'
        '  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });\n'
        '});\n\n'
        'app.post("/api/admin-login", (req, res) => {\n'
        '  const { password } = req.body;\n'
        '  if (!password || typeof password !== "string" || password.length > 100) {\n'
        '    return res.status(400).json({ error: "Invalid request" });\n'
        '  }\n\n'
        '  const expectedPassword = process.env.ADMIN_PASSWORD;\n'
        '  if (!expectedPassword) {\n'
        '    return res.status(500).json({ error: "Server error" });\n'
        '  }\n'
        '  if (password !== expectedPassword) {\n'
        '    return res.status(401).json({ error: "Invalid credentials" });\n'
        '  }\n\n'
        '  const token = signToken({\n'
        '    uid: "admin-custom",\n'
        '    email: "mudzimwapanashe123@gmail.com",\n'
        '    name: "Panashe Mudzimwa (Admin)"\n'
        '  });\n\n'
        '  res.json({\n'
        '    success: true,\n'
        '    token,\n'
        '    user: {\n'
        '      name: "Panashe Mudzimwa (Admin)",\n'
        '      email: "mudzimwapanashe123@gmail.com",\n'
        '      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=PM&backgroundColor=059669`\n'
        '    }\n'
        '  });\n'
        '=======\n'
        ' // ─── Health Check Route (Required for Render Deployment) ──────────────────────\n'
        ' app.get("/api/health", (req, res) => {\n'
        '   res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });\n'
        '>>>>>>> merge/workspace-changes\n'
        '});',
        '// ─── Public Admin Login & Health Endpoints ────────────────────────────────────\n'
        'app.get("/api/health", (req, res) => {\n'
        '  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });\n'
        '});\n\n'
        'app.post("/api/admin-login", (req, res) => {\n'
        '  const { password } = req.body;\n'
        '  if (!password || typeof password !== "string" || password.length > 100) {\n'
        '    return res.status(400).json({ error: "Invalid request" });\n'
        '  }\n\n'
        '  const expectedPassword = process.env.ADMIN_PASSWORD;\n'
        '  if (!expectedPassword) {\n'
        '    return res.status(500).json({ error: "Server error" });\n'
        '  }\n'
        '  if (password !== expectedPassword) {\n'
        '    return res.status(401).json({ error: "Invalid credentials" });\n'
        '  }\n\n'
        '  const token = signToken({\n'
        '    uid: "admin-custom",\n'
        '    email: "mudzimwapanashe123@gmail.com",\n'
        '    name: "Panashe Mudzimwa (Admin)"\n'
        '  });\n\n'
        '  res.json({\n'
        '    success: true,\n'
        '    token,\n'
        '    user: {\n'
        '      name: "Panashe Mudzimwa (Admin)",\n'
        '      email: "mudzimwapanashe123@gmail.com",\n'
        '      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=PM&backgroundColor=059669`\n'
        '    }\n'
        '  });\n'
        '});'
    ),
    (
        '<<<<<<< HEAD\n'
        '    const bookId = `b-${Date.now()}`;\n'
        '=======\n'
        '    const bookId = `b-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;\n'
        '>>>>>>> merge/workspace-changes',
        '    const bookId = `b-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;'
    ),
    (
        '<<<<<<< HEAD\n'
        '    const feedbackId = `fb-${Date.now()}`;\n'
        '=======\n'
        '    const feedbackId = `fb-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;\n'
        '>>>>>>> merge/workspace-changes',
        '    const feedbackId = `fb-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;'
    ),
    (
        '<<<<<<< HEAD\n'
        '    const feedbackId = `fb-${Date.now()}`;\n'
        '=======\n'
        '    const feedbackId = `fb-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;\n'
        '>>>>>>> merge/workspace-changes',
        '    const feedbackId = `fb-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;'
    ),
    (
        '<<<<<<< HEAD\n'
        '    const contactId = `c-${Date.now()}`;\n'
        '=======\n'
        '    const contactId = `c-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;\n'
        '>>>>>>> merge/workspace-changes',
        '    const contactId = `c-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;'
    ),
    (
        '<<<<<<< HEAD\n'
        '    const spId = `s-${Date.now()}`;\n'
        '=======\n'
        '    const spId = `s-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;\n'
        '>>>>>>> merge/workspace-changes',
        '    const spId = `s-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;'
    )
]

for old, new in replacements:
    if old not in text:
        raise SystemExit(f"REPLACEMENT NOT FOUND: {old[:60]!r}...")
    text = text.replace(old, new)

path.write_text(text.replace('\n', '\r\n'), encoding='utf-8')
print('replacements applied')
