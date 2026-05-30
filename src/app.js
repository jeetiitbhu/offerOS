import React, { useEffect, useMemo, useState } from "https://esm.sh/react@18.2.0";
import { createRoot } from "https://esm.sh/react-dom@18.2.0/client";

const h = React.createElement;
const defaultCandidateId = "alex-rivera";

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Request failed");
  return json;
}

function timeLabel(value) {
  return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function App() {
  const [screen, setScreen] = useState("dashboard");
  const [state, setState] = useState({ commonDocuments: [], candidates: [], messages: [], escalations: [], providerStatus: {} });
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("Loading OfferOS backend...");

  async function refresh() {
    const data = await api("/api/bootstrap");
    setState(data);
    setNotice(providerNotice(data.providerStatus));
  }

  useEffect(() => {
    refresh().catch((error) => setNotice(error.message));
  }, []);

  const activeCandidate = state.candidates.find((candidate) => candidate.id === defaultCandidateId) || state.candidates[0];
  const candidateMessages = useMemo(
    () => state.messages.filter((message) => message.candidateId === activeCandidate?.id),
    [state.messages, activeCandidate]
  );

  async function createCandidate() {
    setBusy(true);
    try {
      await api("/api/candidates", {
        method: "POST",
        body: JSON.stringify({
          name: "Priya Shah",
          email: "priya.shah@email.com",
          role: "Data Scientist"
        })
      });
      await refresh();
      setNotice("Created Priya Shah and generated a secure candidate token.");
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function addCommonDocument() {
    setBusy(true);
    try {
      await api("/api/documents/common", {
        method: "POST",
        body: JSON.stringify({
          name: "Remote Work Policy.pdf",
          size: "430 KB",
          text: "Remote work is supported for approved roles. Candidates should confirm location and remote expectations with their recruiter."
        })
      });
      await refresh();
      setNotice("Added Remote Work Policy to common documents.");
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function refreshIntelligence() {
    if (!activeCandidate) return;
    setBusy(true);
    try {
      const result = await api(`/api/candidates/${activeCandidate.id}/intelligence`, { method: "POST" });
      await refresh();
      setNotice(`Candidate intelligence refreshed via ${result.provider}.`);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function askQuestion(event) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || !activeCandidate) return;

    setBusy(true);
    setQuestion("");
    try {
      const result = await api("/api/chat", {
        method: "POST",
        body: JSON.stringify({ candidateId: activeCandidate.id, question: trimmed })
      });
      await refresh();
      setNotice(result.escalation ? "Question escalated to HR." : `Answered with ${result.message.provider}.`);
    } catch (error) {
      setQuestion(trimmed);
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  }

  return h(
    "main",
    { className: "app-frame" },
    h(BrandSidebar, { screen, setScreen, providerStatus: state.providerStatus }),
    screen === "dashboard"
      ? h(Dashboard, {
          docs: state.commonDocuments,
          candidates: state.candidates,
          escalations: state.escalations,
          providerStatus: state.providerStatus,
          notice,
          busy,
          createCandidate,
          addCommonDocument,
          refreshIntelligence
        })
      : h(AskScreen, {
          candidate: activeCandidate,
          messages: candidateMessages,
          question,
          setQuestion,
          askQuestion,
          busy,
          notice
        })
  );
}

function providerNotice(status = {}) {
  const live = Object.entries(status).filter(([, enabled]) => enabled).map(([name]) => name);
  return live.length ? `Live integrations: ${live.join(", ")}` : "Running with local mock providers. Add .env keys to enable Box, OpenAI, Apify, and notifications.";
}

function BrandSidebar({ screen, setScreen, providerStatus }) {
  const boxLive = providerStatus?.box;

  return h(
    "aside",
    { className: screen === "ask" ? "sidebar ask-sidebar" : "sidebar" },
    h("div", { className: "brand-lockup" }, h("span", { className: "spark-logo" }), h("div", null, h("strong", null, "Acme"), screen === "dashboard" ? h("small", null, "Offer Portal") : null)),
    h("nav", { className: "side-nav" },
      h("button", { className: screen === "dashboard" ? "active" : "", onClick: () => setScreen("dashboard") }, h("span", { className: "nav-icon home" }), "Dashboard"),
      h("button", { className: screen === "ask" ? "active" : "", onClick: () => setScreen("ask") }, h("span", { className: "nav-icon chat" }), "Ask"),
      h("button", { onClick: () => setScreen("ask") }, h("span", { className: "nav-icon file" }), screen === "ask" ? "Sources" : "Settings"),
      screen === "ask" ? h("button", null, h("span", { className: "nav-icon help" }), "Help") : null
    ),
    screen === "dashboard"
      ? h("div", { className: "box-card" }, h("span", { className: "nav-icon folder" }), h("strong", null, boxLive ? "Connected to Box" : "Box demo mode"), h("p", null, "Acme Offer Portal"), h("button", null, "Open in Box", h("span", { className: "external" })))
      : h("div", { className: "disclaimer-card" }, h("span", { className: "shield" }), h("p", null, "Answers are based only on documents provided by Acme. Not legal, tax, or financial advice. Please confirm details with Acme.")),
    screen === "dashboard"
      ? h("div", { className: "user-footer" }, h("span", { className: "avatar sj" }, "SJ"), h("div", null, h("strong", null, "Sarah Johnson"), h("small", null, "sarah@acme.com")), h("span", { className: "chevron" }))
      : h("button", { className: "logout-button" }, h("span", { className: "logout-icon" }), "Log out")
  );
}

function Dashboard({ docs, candidates, escalations, providerStatus, notice, busy, createCandidate, addCommonDocument, refreshIntelligence }) {
  return h(
    "section",
    { className: "workspace" },
    h("header", { className: "workspace-header" }, h("div", null, h("h1", null, "Dashboard"), h("p", null, "Manage common documents and candidate offers.")), h("button", { className: "primary-button", disabled: busy, onClick: createCandidate }, h("span", { className: "invite-icon" }), "Invite Candidate")),
    h(IntegrationStrip, { providerStatus, notice }),
    h(
      "section",
      { className: "panel docs-panel" },
      h(PanelIntro, { icon: "folder", title: "Common Documents", text: "These documents are available to all candidates.", actions: ["Open in Box", "Upload Common Docs"], onPrimary: addCommonDocument, busy }),
      h("div", { className: "doc-table table" },
        h("div", { className: "table-head" }, h("span", null, "File Name"), h("span", null, "Uploaded"), h("span", null, "Size"), h("span")),
        docs.map((doc) => h("div", { className: "table-row", key: doc.id || doc.name }, h("span", null, h("i", { className: "pdf-icon" }), h("strong", null, doc.name)), h("span", null, doc.uploaded), h("span", null, doc.size), h("button", { className: "kebab" }, "...")))
      ),
      h("button", { className: "link-button" }, "View all in Box", h("span", { className: "external" }))
    ),
    h(
      "section",
      { className: "panel candidates-panel" },
      h(PanelIntro, { icon: "people", title: "Candidates", text: "Manage candidate-specific offer documents and details." }),
      h("div", { className: "candidate-table table" },
        h("div", { className: "table-head" }, h("span", null, "Candidate"), h("span", null, "Status"), h("span", null, "Offer Docs"), h("span", null, "Offer Details"), h("span", null, "Last Updated"), h("span", null, "Actions")),
        candidates.map((candidate) =>
          h("div", { className: "candidate-row table-row", key: candidate.id },
            h("span", null, h("i", { className: `avatar ${candidate.color || "purple"}` }, candidate.initials), h("span", null, h("strong", null, candidate.name), h("small", null, candidate.email))),
            h("span", null, h("b", { className: candidate.status === "Active" ? "status active" : "status invited" }, candidate.status)),
            h("span", { className: candidate.offerDocs === "No files" ? "muted-cell" : "" }, candidate.offerDocs === "No files" ? h(React.Fragment, null, h("em", null, "-"), h("small", null, "No files")) : h(React.Fragment, null, h("i", { className: "mini-doc" }), candidate.offerDocs)),
            h("span", { className: candidate.offerDetails === "Completed" ? "complete-cell" : "muted-cell" }, h("i"), candidate.offerDetails),
            h("span", null, candidate.updated),
            h("span", { className: "action-cell" }, h("button", { disabled: busy }, "Upload Docs"), h("button", { disabled: busy, onClick: refreshIntelligence }, "Refresh Intel"), h("button", { className: "kebab" }, "..."))
          )
        )
      ),
      h("button", { className: "link-button" }, `${escalations.filter((item) => item.status === "Open").length} open escalation${escalations.filter((item) => item.status === "Open").length === 1 ? "" : "s"}`)
    )
  );
}

function IntegrationStrip({ providerStatus = {}, notice }) {
  return h("section", { className: "integration-strip" },
    ["box", "openai", "apify", "notifications"].map((name) => h("span", { className: providerStatus[name] ? "live" : "", key: name }, name)),
    h("p", null, notice)
  );
}

function PanelIntro({ icon, title, text, actions = [], onPrimary, busy }) {
  return h("div", { className: "panel-intro" },
    h("span", { className: `panel-icon ${icon}` }),
    h("div", null, h("h2", null, title), h("p", null, text)),
    actions.length ? h("div", { className: "panel-actions" }, h("button", null, actions[0], h("span", { className: "external" })), h("button", { className: "primary-button", disabled: busy, onClick: onPrimary }, h("span", { className: "upload-icon" }), actions[1])) : null
  );
}

function AskScreen({ candidate, messages, question, setQuestion, askQuestion, busy, notice }) {
  return h(
    "section",
    { className: "ask-workspace" },
    h("header", { className: "ask-header" }, h("h1", null, "Ask about your offer"), h("div", { className: "candidate-welcome" }, h("strong", null, `Welcome, ${candidate?.name?.split(" ")[0] || "Alex"}`), h("span", null, candidate?.initials?.[0] || "A"))),
    h("div", { className: "chat-canvas" },
      messages.map((message) =>
        message.role === "candidate"
          ? h(UserBubble, { key: message.id, text: message.text, time: timeLabel(message.createdAt) })
          : h(AssistantAnswer, { key: message.id, text: message.text, label: message.classification === "yellow" ? "Escalated to HR" : `Sources (${message.sources?.length || 0})`, sources: message.sources || [] })
      ),
      h("p", { className: "chat-notice" }, notice),
      h("form", { className: "ask-input", onSubmit: askQuestion },
        h("span", { className: "paperclip" }),
        h("input", { value: question, onChange: (event) => setQuestion(event.target.value), placeholder: "Ask anything about your offer, benefits, or equity..." }),
        h("button", { disabled: busy, type: "submit" }, h("span", { className: "send-icon" }))
      )
    )
  );
}

function UserBubble({ text, time }) {
  return h("div", { className: "user-question" }, h("p", null, text), h("time", null, time));
}

function AssistantAnswer({ text, label, sources }) {
  return h("div", { className: "assistant-row" },
    h("span", { className: "assistant-spark" }, h("span", { className: "spark-logo" })),
    h("article", { className: "answer-card" },
      h("div", { className: "answer-actions" }, h("span", { className: "thumb up" }), h("span", { className: "thumb down" })),
      text.split("\n").map((line, index) => line ? h("p", { key: index }, line) : h("br", { key: index })),
      h("div", { className: "source-header" }, label, h("span", { className: "caret-up" })),
      sources.length ? h("div", { className: "source-grid" }, sources.map((source) => h("div", { className: "source-card", key: source.id || source.name }, h("i", { className: source.name?.toLowerCase().includes("pdf") ? "pdf-icon" : "blue-doc-icon" }), h("span", null, h("strong", null, source.name), source.page ? h("small", null, source.page) : null)))) : null
    )
  );
}

createRoot(document.getElementById("root")).render(h(App));
