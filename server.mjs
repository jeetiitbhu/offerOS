import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { extname, join, normalize } from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const root = process.cwd();
const port = Number(process.env.PORT || 5173);
const host = process.env.HOST || "127.0.0.1";
const dataDir = join(root, "data");
const seedPath = join(dataDir, "seed.json");
const dbPath = process.env.OFFEROS_DB_PATH || join(dataDir, "offeros-db.json");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

await loadDotEnv();

function providerStatus() {
  return {
    box: Boolean(process.env.BOX_DEVELOPER_TOKEN),
    openai: Boolean(process.env.OPENAI_API_KEY),
    apify: Boolean(process.env.APIFY_TOKEN && process.env.APIFY_ACTOR_ID),
    notifications: Boolean(process.env.NOTIFY_WEBHOOK_URL)
  };
}

async function loadDotEnv() {
  try {
    const file = await readFile(join(root, ".env"), "utf8");

    for (const line of file.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separator = trimmed.indexOf("=");
      if (separator === -1) continue;
      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env is optional. Missing keys fall back to demo providers.
  }
}

async function readDb() {
  await ensureDb();
  return JSON.parse(await readFile(dbPath, "utf8"));
}

async function writeDb(db) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dbPath, `${JSON.stringify(db, null, 2)}\n`);
}

async function ensureDb() {
  try {
    await readFile(dbPath, "utf8");
  } catch {
    await mkdir(dataDir, { recursive: true });
    const seed = await readFile(seedPath, "utf8");
    await writeFile(dbPath, seed);
  }
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function sendError(response, status, message, details) {
  sendJson(response, status, { error: message, details });
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function resolvePath(url) {
  const pathname = decodeURIComponent(new URL(url, `http://${host}:${port}`).pathname);
  const cleanPath = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  return join(root, cleanPath === "/" ? "index.html" : cleanPath);
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || randomUUID();
}

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "CA";
}

function todayLabel(date = new Date()) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function classifyQuestion(question) {
  const text = question.toLowerCase();
  const red = ["sports", "politics", "recipe", "weather", "movie", "general knowledge"];
  const yellow = ["adjust", "negotiate", "negotiation", "increase", "base salary", "compensation change", "more equity", "modify offer"];

  if (red.some((term) => text.includes(term))) return "red";
  if (yellow.some((term) => text.includes(term))) return "yellow";
  return "green";
}

function documentScore(question, document) {
  const stopwords = new Set(["about", "after", "and", "are", "can", "does", "for", "how", "the", "what", "when", "with", "work", "your"]);
  const words = question.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2 && !stopwords.has(word));
  const haystack = `${document.name} ${document.text || ""}`.toLowerCase();
  return words.reduce((score, word) => score + (haystack.includes(word) ? 1 : 0), 0);
}

function retrieveDocuments(db, candidateId, question) {
  const candidateDocs = db.documents.filter((document) => document.candidateId === candidateId);
  const docs = [...db.commonDocuments, ...candidateDocs];
  return docs
    .map((document) => ({ ...document, score: documentScore(question, document) }))
    .filter((document) => document.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, 3);
}

function mockAnswer(question, classification, docs) {
  const text = question.toLowerCase();

  if (classification === "red") {
    return "This portal only supports offer-related questions.";
  }

  if (classification === "yellow") {
    return "Thank you. Your recruiter has been notified and will respond shortly.";
  }

  if (text.includes("exercise window")) {
    return "Based on the company's Equity FAQ, vested options generally must be exercised within 90 days after leaving the company. Unvested options are typically forfeited when employment ends.";
  }

  if (text.includes("early exercise")) {
    return "I couldn't find a clear answer in the documents provided. The documents don't specify whether early exercise is allowed. Please confirm this with Acme or your recruiter.";
  }

  if (text.includes("pto") || text.includes("vacation")) {
    return "The PTO policy says salaried employees can request flexible paid time off with manager approval and should submit planned absences in the HR system.";
  }

  if (text.includes("benefit") || text.includes("health")) {
    return "The Benefits Guide outlines medical, dental, vision, and enrollment windows. Coverage begins on the first day of the month after your start date.";
  }

  const sourceNames = docs.map((document) => document.name).join(", ") || "the offer documents";
  return `I found relevant information in ${sourceNames}. Please review the cited sources and confirm sensitive details with your recruiter.`;
}

async function generateAnswer(question, classification, docs) {
  if (!process.env.OPENAI_API_KEY || classification !== "green") {
    return { answer: mockAnswer(question, classification, docs), provider: "mock" };
  }

  const context = docs.map((document) => `Source: ${document.name}\n${document.text || ""}`).join("\n\n");
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: "You answer candidate offer questions only from provided source text. If the answer is missing, say that clearly and ask the candidate to confirm with Acme or their recruiter. Keep the response concise."
        },
        {
          role: "user",
          content: `Question: ${question}\n\nSources:\n${context}`
        }
      ]
    })
  });

  const json = await response.json();
  if (!response.ok) throw new Error(json.error?.message || "OpenAI request failed");
  const output = json.output_text || json.output?.flatMap((item) => item.content || []).map((part) => part.text).filter(Boolean).join("\n");
  return { answer: output || mockAnswer(question, classification, docs), provider: "openai" };
}

async function listBoxFolder(folderId) {
  if (!process.env.BOX_DEVELOPER_TOKEN || !folderId) return null;

  const response = await fetch(`https://api.box.com/2.0/folders/${folderId}/items?limit=100&fields=id,type,name,size,modified_at`, {
    headers: { Authorization: `Bearer ${process.env.BOX_DEVELOPER_TOKEN}` }
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || "Box folder request failed");

  return (json.entries || []).map((entry) => ({
    id: `box-${entry.id}`,
    boxId: entry.id,
    name: entry.name,
    uploaded: entry.modified_at ? todayLabel(new Date(entry.modified_at)) : todayLabel(),
    size: entry.size ? `${Math.max(1, Math.round(entry.size / 1024))} KB` : "Folder",
    source: "box"
  }));
}

async function createBoxCandidateFolder(candidateName) {
  if (!process.env.BOX_DEVELOPER_TOKEN || !process.env.BOX_CANDIDATES_FOLDER_ID) {
    return { provider: "mock", folderId: `mock-${slug(candidateName)}` };
  }

  const response = await fetch("https://api.box.com/2.0/folders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.BOX_DEVELOPER_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: candidateName,
      parent: { id: process.env.BOX_CANDIDATES_FOLDER_ID }
    })
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || "Box folder creation failed");
  return { provider: "box", folderId: json.id };
}

async function collectCandidateIntelligence(candidate) {
  if (!process.env.APIFY_TOKEN || !process.env.APIFY_ACTOR_ID) {
    return {
      provider: "mock",
      signals: [
        { title: "GitHub active", text: "Pushed 7 commits in the last 30 days" },
        { title: "LinkedIn updated", text: "Added 2 new roles in the past 60 days" },
        { title: "Blog post about AI infra", text: "Published a recent technical post" }
      ]
    };
  }

  const actor = encodeURIComponent(process.env.APIFY_ACTOR_ID);
  const response = await fetch(`https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?clean=true`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.APIFY_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ candidate })
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error?.message || "Apify actor run failed");
  return { provider: "apify", signals: Array.isArray(json) ? json.slice(0, 5) : [] };
}

async function notifyHr(payload) {
  if (!process.env.NOTIFY_WEBHOOK_URL) return { provider: "mock", delivered: false };

  const response = await fetch(process.env.NOTIFY_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error("Notification webhook failed");
  return { provider: "webhook", delivered: true };
}

function publicCandidate(candidate) {
  return {
    id: candidate.id,
    initials: candidate.initials,
    name: candidate.name,
    email: candidate.email,
    role: candidate.role,
    status: candidate.status,
    offerDocs: candidate.offerDocs,
    offerDetails: candidate.offerDetails,
    updated: candidate.updated,
    color: candidate.color,
    token: candidate.token,
    folderId: candidate.folderId,
    intelligence: candidate.intelligence || []
  };
}

async function routeApi(request, response, url) {
  const db = await readDb();
  const method = request.method || "GET";
  const path = url.pathname;

  if (method === "GET" && path === "/api/health") {
    return sendJson(response, 200, { ok: true, providers: providerStatus() });
  }

  if (method === "GET" && path === "/api/bootstrap") {
    let commonDocuments = db.commonDocuments;
    try {
      const boxDocuments = await listBoxFolder(process.env.BOX_COMMON_FOLDER_ID);
      if (boxDocuments?.length) commonDocuments = boxDocuments;
    } catch (error) {
      db.integrationEvents.unshift({ id: randomUUID(), provider: "box", status: "error", message: error.message, createdAt: new Date().toISOString() });
      await writeDb(db);
    }

    return sendJson(response, 200, {
      commonDocuments,
      candidates: db.candidates.map(publicCandidate),
      messages: db.messages,
      escalations: db.escalations,
      providerStatus: providerStatus()
    });
  }

  if (method === "POST" && path === "/api/documents/common") {
    const body = await readJson(request);
    const document = {
      id: randomUUID(),
      name: body.name || "Untitled.pdf",
      uploaded: todayLabel(),
      size: body.size || "Pending",
      text: body.text || "",
      source: "manual"
    };
    db.commonDocuments.unshift(document);
    await writeDb(db);
    return sendJson(response, 201, { document });
  }

  if (method === "POST" && path === "/api/candidates") {
    const body = await readJson(request);
    if (!body.name || !body.email) return sendError(response, 400, "Candidate name and email are required");

    const folder = await createBoxCandidateFolder(body.name);
    const candidate = {
      id: slug(body.name),
      initials: initials(body.name),
      name: body.name,
      email: body.email,
      role: body.role || "Candidate",
      status: "Invited",
      offerDocs: "No files",
      offerDetails: "Not added",
      updated: todayLabel(),
      color: "purple",
      token: randomUUID(),
      folderId: folder.folderId,
      intelligence: []
    };

    db.candidates.unshift(candidate);
    db.integrationEvents.unshift({ id: randomUUID(), provider: folder.provider, status: "ok", message: `Created candidate folder for ${body.name}`, createdAt: new Date().toISOString() });
    await writeDb(db);
    return sendJson(response, 201, { candidate: publicCandidate(candidate) });
  }

  const candidateMatch = path.match(/^\/api\/candidates\/([^/]+)$/);
  if (method === "GET" && candidateMatch) {
    const candidate = db.candidates.find((item) => item.id === candidateMatch[1]);
    if (!candidate) return sendError(response, 404, "Candidate not found");
    return sendJson(response, 200, { candidate: publicCandidate(candidate) });
  }

  const intelligenceMatch = path.match(/^\/api\/candidates\/([^/]+)\/intelligence$/);
  if (method === "POST" && intelligenceMatch) {
    const candidate = db.candidates.find((item) => item.id === intelligenceMatch[1]);
    if (!candidate) return sendError(response, 404, "Candidate not found");
    const intelligence = await collectCandidateIntelligence(candidate);
    candidate.intelligence = intelligence.signals;
    db.integrationEvents.unshift({ id: randomUUID(), provider: intelligence.provider, status: "ok", message: `Refreshed intelligence for ${candidate.name}`, createdAt: new Date().toISOString() });
    await writeDb(db);
    return sendJson(response, 200, { candidate: publicCandidate(candidate), provider: intelligence.provider });
  }

  if (method === "POST" && path === "/api/chat") {
    const body = await readJson(request);
    const candidateId = body.candidateId || db.candidates[0]?.id;
    const question = String(body.question || "").trim();
    if (!question) return sendError(response, 400, "Question is required");

    const candidate = db.candidates.find((item) => item.id === candidateId);
    if (!candidate) return sendError(response, 404, "Candidate not found");

    const classification = classifyQuestion(question);
    const docs = retrieveDocuments(db, candidateId, question);
    const generated = await generateAnswer(question, classification, docs);
    const now = new Date().toISOString();
    const userMessage = { id: randomUUID(), candidateId, role: "candidate", text: question, createdAt: now };
    const assistantMessage = {
      id: randomUUID(),
      candidateId,
      role: "assistant",
      text: generated.answer,
      classification,
      provider: generated.provider,
      sources: docs.map((document) => ({ id: document.id, name: document.name, page: document.page || "" })),
      createdAt: new Date().toISOString()
    };

    db.messages.push(userMessage, assistantMessage);

    let escalation = null;
    if (classification === "yellow") {
      escalation = {
        id: randomUUID(),
        candidateId,
        candidateName: candidate.name,
        question,
        category: "Offer modification",
        priority: "High",
        status: "Open",
        recommendation: "Recruiter should review the compensation concern and respond directly.",
        createdAt: now
      };
      db.escalations.unshift(escalation);
      await notifyHr({ type: "offer_escalation", escalation });
    }

    db.auditLog.unshift({
      id: randomUUID(),
      candidateId,
      question,
      classification,
      sources: docs.map((document) => document.name),
      provider: generated.provider,
      escalated: Boolean(escalation),
      createdAt: now
    });

    await writeDb(db);
    return sendJson(response, 200, { message: assistantMessage, escalation });
  }

  if (method === "GET" && path === "/api/escalations") {
    return sendJson(response, 200, { escalations: db.escalations });
  }

  const escalationMatch = path.match(/^\/api\/escalations\/([^/]+)\/respond$/);
  if (method === "POST" && escalationMatch) {
    const body = await readJson(request);
    const escalation = db.escalations.find((item) => item.id === escalationMatch[1]);
    if (!escalation) return sendError(response, 404, "Escalation not found");
    escalation.status = "Resolved";
    escalation.response = body.response || "Thanks, our team reviewed this and will follow up directly.";
    escalation.resolvedAt = new Date().toISOString();
    db.messages.push({
      id: randomUUID(),
      candidateId: escalation.candidateId,
      role: "recruiter",
      text: escalation.response,
      createdAt: escalation.resolvedAt
    });
    await writeDb(db);
    return sendJson(response, 200, { escalation });
  }

  return sendError(response, 404, "API route not found");
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${host}:${port}`);

  try {
    if (url.pathname.startsWith("/api/")) {
      return await routeApi(request, response, url);
    }

    const filePath = resolvePath(request.url || "/");
    const file = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream"
    });
    response.end(file);
  } catch (error) {
    if (url.pathname.startsWith("/api/")) {
      return sendError(response, 500, "Server error", error.message);
    }

    const fallback = await readFile(join(root, "index.html"));
    response.writeHead(200, { "Content-Type": mimeTypes[".html"] });
    response.end(fallback);
  }
});

server.listen(port, host, () => {
  console.log(`OfferOS is running at http://${host}:${port}`);
});
