import React, { useState } from "https://esm.sh/react@18.2.0";
import { createRoot } from "https://esm.sh/react-dom@18.2.0/client";

const h = React.createElement;

const commonDocuments = [
  { id: "benefits", name: "Benefits Guide", type: "Common", folder: "/Common", views: 12, status: "Synced" },
  { id: "equity", name: "Equity FAQ", type: "Common", folder: "/Common", views: 18, status: "Synced" },
  { id: "pto", name: "PTO Policy", type: "Common", folder: "/Common", views: 9, status: "Synced" },
  { id: "career", name: "Career Framework", type: "Common", folder: "/Common", views: 7, status: "Synced" },
  { id: "remote", name: "Remote Work Policy", type: "Common", folder: "/Common", views: 11, status: "Synced" }
];

const candidates = [
  {
    id: "alex",
    name: "Alex Morgan",
    email: "alex.morgan@example.com",
    role: "Senior AI Engineer",
    status: "Offer sent",
    token: "offer-os-alex-magic-link",
    questions: 6,
    escalations: 1,
    lastActivity: "12 min ago",
    lastLogin: "Today, 9:42 AM",
    folder: "/Candidates/alex",
    documents: [
      { name: "Offer Letter", type: "Candidate", status: "Viewed", views: 4 },
      { name: "Compensation Breakdown", type: "Candidate", status: "Viewed", views: 3 },
      { name: "Equity Grant", type: "Candidate", status: "Viewed", views: 5 },
      { name: "Relocation Package", type: "Candidate", status: "Not viewed", views: 0 }
    ],
    activity: [
      "Viewed Equity FAQ",
      "Asked: How does vesting work?",
      "Viewed Compensation Breakdown",
      "Asked: Can compensation be adjusted?"
    ],
    intelligence: {
      interests: ["AI infrastructure", "Open source", "Distributed systems"],
      publicActivity: ["Maintained a vector search demo", "Published notes on model serving", "Starred infra observability repos"],
      talkingPoints: ["Technical ownership", "OSS culture", "Engineering roadmap"]
    }
  },
  {
    id: "maya",
    name: "Maya Chen",
    email: "maya.chen@example.com",
    role: "Product Design Lead",
    status: "Negotiation",
    token: "offer-os-maya-magic-link",
    questions: 4,
    escalations: 2,
    lastActivity: "1 hr ago",
    lastLogin: "Yesterday, 5:18 PM",
    folder: "/Candidates/maya",
    documents: [
      { name: "Offer Letter", type: "Candidate", status: "Viewed", views: 2 },
      { name: "Compensation Breakdown", type: "Candidate", status: "Viewed", views: 4 },
      { name: "Equity Grant", type: "Candidate", status: "Viewed", views: 1 }
    ],
    activity: ["Viewed Benefits Guide", "Asked: What is the design ladder?", "Asked: Is the equity grant negotiable?"],
    intelligence: {
      interests: ["Design systems", "Mentorship", "Accessibility"],
      publicActivity: ["Spoke about inclusive product rituals", "Updated portfolio case study"],
      talkingPoints: ["Team charter", "Design quality bar", "Mentorship opportunities"]
    }
  },
  {
    id: "jordan",
    name: "Jordan Patel",
    email: "jordan.patel@example.com",
    role: "Staff Backend Engineer",
    status: "Accepted",
    token: "offer-os-jordan-magic-link",
    questions: 2,
    escalations: 0,
    lastActivity: "2 days ago",
    lastLogin: "Monday, 2:04 PM",
    folder: "/Candidates/jordan",
    documents: [
      { name: "Offer Letter", type: "Candidate", status: "Viewed", views: 1 },
      { name: "Compensation Breakdown", type: "Candidate", status: "Viewed", views: 1 }
    ],
    activity: ["Viewed PTO Policy", "Asked: How does remote work approval happen?"],
    intelligence: {
      interests: ["Databases", "Reliability", "Developer tooling"],
      publicActivity: ["Contributed to a Postgres extension", "Wrote about on-call quality"],
      talkingPoints: ["Reliability roadmap", "Tooling investment", "Staff scope"]
    }
  }
];

const initialEscalations = [
  {
    id: "esc-1",
    candidateId: "alex",
    question: "Can compensation be adjusted?",
    category: "Compensation negotiation",
    priority: "High",
    status: "Open",
    recommendation: "Acknowledge the concern, confirm recruiter review, and prepare a compensation range discussion."
  },
  {
    id: "esc-2",
    candidateId: "maya",
    question: "Is the equity grant negotiable?",
    category: "Equity change",
    priority: "High",
    status: "Open",
    recommendation: "Route to recruiting lead. Candidate has reviewed equity docs multiple times."
  }
];

const sampleAudit = [
  { question: "How does equity vest?", docs: "Equity FAQ, Equity Grant", confidence: "92%", result: "Answered" },
  { question: "Can compensation be adjusted?", docs: "Compensation Breakdown", confidence: "71%", result: "Escalated" },
  { question: "What is the PTO policy?", docs: "PTO Policy", confidence: "95%", result: "Answered" }
];

function classifyQuestion(value) {
  const text = value.toLowerCase();
  const yellow = ["adjust", "negotiat", "increase", "change offer", "more equity", "salary", "compensation", "modify"];
  const red = ["politics", "sports", "weather", "recipe", "movie", "general knowledge"];

  if (red.some((term) => text.includes(term))) {
    return {
      level: "red",
      label: "Out of scope",
      docs: [],
      answer: "This portal only supports offer-related questions.",
      confidence: "0%"
    };
  }

  if (yellow.some((term) => text.includes(term))) {
    return {
      level: "yellow",
      label: "Human review",
      docs: ["Compensation Breakdown", "Equity Grant"],
      answer: "Thank you. Your recruiter has been notified and will respond shortly.",
      confidence: "68%"
    };
  }

  if (text.includes("equity") || text.includes("vesting") || text.includes("grant")) {
    return {
      level: "green",
      label: "AI answered",
      docs: ["Equity FAQ", "Equity Grant"],
      answer: "Equity typically vests over four years with a one-year cliff. Your grant document contains the exact schedule and share count.",
      confidence: "92%"
    };
  }

  if (text.includes("pto") || text.includes("vacation") || text.includes("time off")) {
    return {
      level: "green",
      label: "AI answered",
      docs: ["PTO Policy", "Benefits Guide"],
      answer: "The PTO policy explains annual time off, holidays, and manager approval steps. Review the PTO Policy for exact eligibility.",
      confidence: "95%"
    };
  }

  if (text.includes("benefit") || text.includes("health") || text.includes("insurance")) {
    return {
      level: "green",
      label: "AI answered",
      docs: ["Benefits Guide"],
      answer: "Benefits details are pulled from the Benefits Guide, including medical coverage, enrollment windows, and family options.",
      confidence: "90%"
    };
  }

  return {
    level: "green",
    label: "AI answered",
    docs: ["Benefits Guide", "Career Framework"],
    answer: "I found relevant offer information in the Box document set. For exact terms, use the linked source documents below.",
    confidence: "84%"
  };
}

function App() {
  const [activeView, setActiveView] = useState("hr");
  const [selectedCandidateId, setSelectedCandidateId] = useState("alex");
  const [escalations, setEscalations] = useState(initialEscalations);
  const [candidateQuestion, setCandidateQuestion] = useState("How does equity vest?");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Welcome back, Alex. Ask any offer-related question and I will answer from Box documents or route sensitive questions to HR.",
      meta: "OfferOS Assistant"
    }
  ]);

  const selectedCandidate = candidates.find((candidate) => candidate.id === selectedCandidateId) || candidates[0];
  const openEscalations = escalations.filter((item) => item.status === "Open");
  const candidateEscalations = escalations.filter((item) => item.candidateId === selectedCandidate.id);

  function submitQuestion(event) {
    event.preventDefault();
    const trimmed = candidateQuestion.trim();
    if (!trimmed) return;

    const result = classifyQuestion(trimmed);
    const nextMessages = [
      ...messages,
      { role: "candidate", text: trimmed, meta: "Candidate" },
      {
        role: "assistant",
        text: result.answer,
        meta: `${result.label} • ${result.confidence}`,
        sources: result.docs
      }
    ];

    if (result.level === "yellow") {
      const nextEscalation = {
        id: `esc-${Date.now()}`,
        candidateId: "alex",
        question: trimmed,
        category: "Offer modification",
        priority: "High",
        status: "Open",
        recommendation: "Recruiter should respond directly and document the candidate concern before final negotiation."
      };
      setEscalations([nextEscalation, ...escalations]);
    }

    setMessages(nextMessages);
    setCandidateQuestion("");
  }

  function resolveEscalation(id) {
    setEscalations((current) => current.map((item) => (item.id === id ? { ...item, status: "Resolved" } : item)));
  }

  return h(
    "main",
    { className: "app-shell" },
    h(Topbar, { activeView, setActiveView }),
    h(
      "section",
      { className: "hero-band" },
      h("div", { className: "hero-copy" },
        h("p", { className: "eyebrow" }, "AI offer workspace built on Box"),
        h("h1", null, "OfferOS"),
        h("p", null, "Candidates get one trusted portal for offer answers. HR gets visibility into concerns, escalations, and close-risk signals before they arrive late.")
      ),
      h(SystemMap)
    ),
    activeView === "hr"
      ? h(HRPortal, {
          selectedCandidate,
          selectedCandidateId,
          setSelectedCandidateId,
          openEscalations,
          candidateEscalations,
          resolveEscalation
        })
      : h(CandidatePortal, {
          candidate: candidates[0],
          messages,
          candidateQuestion,
          setCandidateQuestion,
          submitQuestion
        })
  );
}

function Topbar({ activeView, setActiveView }) {
  return h(
    "header",
    { className: "topbar" },
    h("div", { className: "brand" }, h("span", null, "O"), h("strong", null, "OfferOS")),
    h("nav", { className: "view-switch", "aria-label": "Portal view" },
      h("button", { className: activeView === "hr" ? "active" : "", onClick: () => setActiveView("hr") }, "HR Portal"),
      h("button", { className: activeView === "candidate" ? "active" : "", onClick: () => setActiveView("candidate") }, "Candidate Portal")
    )
  );
}

function SystemMap() {
  return h(
    "div",
    { className: "system-map", "aria-label": "OfferOS architecture" },
    h("div", { className: "node box-node" }, h("strong", null, "Box"), h("span", null, "Source of truth")),
    h("div", { className: "map-row" },
      h("div", { className: "node" }, h("strong", null, "HR Portal"), h("span", null, "Manage + respond")),
      h("div", { className: "node" }, h("strong", null, "Candidate Portal"), h("span", null, "Review + ask"))
    ),
    h("div", { className: "map-row" },
      h("div", { className: "node dark" }, h("strong", null, "AI Layer"), h("span", null, "Classify, retrieve, escalate")),
      h("div", { className: "node gold" }, h("strong", null, "Apify Intel"), h("span", null, "Public signals"))
    )
  );
}

function HRPortal({ selectedCandidate, selectedCandidateId, setSelectedCandidateId, openEscalations, candidateEscalations, resolveEscalation }) {
  return h(
    "section",
    { className: "workspace-grid" },
    h("aside", { className: "side-panel" },
      h("div", { className: "panel-heading" }, h("p", null, "Dashboard"), h("h2", null, "Close every offer with context")),
      h("div", { className: "metric-grid" },
        h(Metric, { label: "Candidates", value: candidates.length }),
        h(Metric, { label: "Open escalations", value: openEscalations.length }),
        h(Metric, { label: "Common docs", value: commonDocuments.length }),
        h(Metric, { label: "AI confidence", value: "91%" })
      ),
      h(DocumentList, { title: "Common Documents", documents: commonDocuments, actions: ["Upload", "Replace", "Open in Box"] }),
      h("button", { className: "primary-action" }, "Create Candidate")
    ),
    h("div", { className: "main-panel" },
      h(CandidatesTable, { selectedCandidateId, setSelectedCandidateId }),
      h(CandidateDetail, { candidate: selectedCandidate, escalations: candidateEscalations, resolveEscalation })
    )
  );
}

function Metric({ label, value }) {
  return h("div", { className: "metric" }, h("strong", null, value), h("span", null, label));
}

function DocumentList({ title, documents, actions }) {
  return h(
    "section",
    { className: "document-panel" },
    h("div", { className: "panel-title-row" }, h("h3", null, title), h("span", null, "Box synced")),
    h("div", { className: "doc-list" },
      documents.map((doc) =>
        h("article", { className: "doc-row", key: `${doc.type}-${doc.name}` },
          h("div", null, h("strong", null, doc.name), h("span", null, `${doc.folder || "Candidate folder"} • ${doc.views} views`)),
          h("button", null, doc.status || "Open")
        )
      )
    ),
    h("div", { className: "mini-actions" }, actions.map((action) => h("button", { key: action }, action)))
  );
}

function CandidatesTable({ selectedCandidateId, setSelectedCandidateId }) {
  return h(
    "section",
    { className: "table-panel" },
    h("div", { className: "panel-title-row" }, h("h2", null, "Candidates"), h("button", null, "Generate links")),
    h("div", { className: "candidate-table" },
      h("div", { className: "table-head" }, h("span", null, "Candidate"), h("span", null, "Status"), h("span", null, "Questions"), h("span", null, "Escalations"), h("span", null, "Activity")),
      candidates.map((candidate) =>
        h("button", {
          key: candidate.id,
          className: candidate.id === selectedCandidateId ? "candidate-row selected" : "candidate-row",
          onClick: () => setSelectedCandidateId(candidate.id)
        },
          h("span", null, h("strong", null, candidate.name), h("small", null, candidate.role)),
          h("span", null, candidate.status),
          h("span", null, candidate.questions),
          h("span", null, candidate.escalations),
          h("span", null, candidate.lastActivity)
        )
      )
    )
  );
}

function CandidateDetail({ candidate, escalations, resolveEscalation }) {
  const brief = `${candidate.name} has reviewed compensation-related documents and appears focused on ${candidate.intelligence.interests.slice(0, 2).join(" and ")}. Suggested action: schedule a recruiter follow-up with talking points around ${candidate.intelligence.talkingPoints.slice(0, 2).join(" and ")}.`;

  return h(
    "section",
    { className: "detail-grid" },
    h("div", { className: "candidate-overview" },
      h("div", null, h("p", { className: "eyebrow" }, "Candidate Overview"), h("h2", null, candidate.name), h("p", null, `${candidate.email} • ${candidate.role}`)),
      h("span", { className: "status-pill" }, candidate.status)
    ),
    h(DocumentList, { title: "Uploaded Documents", documents: candidate.documents, actions: ["Upload", "Replace", "Open in Box"] }),
    h("section", { className: "activity-panel" },
      h("div", { className: "panel-title-row" }, h("h3", null, "Candidate Activity"), h("span", null, candidate.lastLogin)),
      h("ul", null, candidate.activity.map((item) => h("li", { key: item }, item)))
    ),
    h("section", { className: "escalation-panel" },
      h("div", { className: "panel-title-row" }, h("h3", null, "Open Escalations"), h("span", null, `${escalations.filter((item) => item.status === "Open").length} open`)),
      escalations.length
        ? escalations.map((item) => h(EscalationCard, { key: item.id, item, resolveEscalation }))
        : h("p", { className: "muted" }, "No escalations for this candidate.")
    ),
    h("section", { className: "intel-panel" },
      h("div", { className: "panel-title-row" }, h("h3", null, "Candidate Intelligence"), h("span", null, "Apify powered")),
      h(TagList, { label: "Interested in", items: candidate.intelligence.interests }),
      h(TagList, { label: "Recent public activity", items: candidate.intelligence.publicActivity }),
      h(TagList, { label: "Suggested talking points", items: candidate.intelligence.talkingPoints })
    ),
    h("section", { className: "brief-panel" },
      h("div", { className: "panel-title-row" }, h("h3", null, "Candidate Brief"), h("button", null, "Generate Candidate Brief")),
      h("p", null, brief)
    )
  );
}

function EscalationCard({ item, resolveEscalation }) {
  return h(
    "article",
    { className: "escalation-card" },
    h("div", null, h("strong", null, item.question), h("span", null, `${item.category} • ${item.priority} priority • ${item.status}`)),
    h("p", null, item.recommendation),
    h("div", { className: "mini-actions" },
      h("button", null, "Reply"),
      item.status === "Open" ? h("button", { onClick: () => resolveEscalation(item.id) }, "Resolve") : null
    )
  );
}

function TagList({ label, items }) {
  return h("div", { className: "tag-section" }, h("span", null, label), h("div", null, items.map((item) => h("strong", { key: item }, item))));
}

function CandidatePortal({ candidate, messages, candidateQuestion, setCandidateQuestion, submitQuestion }) {
  return h(
    "section",
    { className: "candidate-portal" },
    h("div", { className: "candidate-home" },
      h("p", { className: "eyebrow" }, "Magic link authenticated"),
      h("h2", null, `Welcome, ${candidate.name.split(" ")[0]}`),
      h("p", null, `Your offer for ${candidate.role} is ready. Documents and answers are pulled from Box.`),
      h("div", { className: "offer-status" }, h("span", null, "Offer Status"), h("strong", null, candidate.status), h("small", null, `Secure token: ${candidate.token}`))
    ),
    h("div", { className: "portal-grid" },
      h(DocumentList, { title: "Documents", documents: [...commonDocuments.slice(0, 4), ...candidate.documents], actions: ["View", "Download"] }),
      h("section", { className: "chat-panel" },
        h("div", { className: "panel-title-row" }, h("h3", null, "AI Assistant"), h("span", null, "Single chat")),
        h("div", { className: "message-stack" },
          messages.map((message, index) =>
            h("article", { key: `${message.role}-${index}`, className: message.role === "candidate" ? "message user" : "message" },
              h("span", null, message.meta),
              h("p", null, message.text),
              message.sources?.length ? h("div", { className: "source-list" }, message.sources.map((source) => h("strong", { key: source }, source))) : null
            )
          )
        ),
        h("form", { className: "question-form", onSubmit: submitQuestion },
          h("textarea", {
            value: candidateQuestion,
            onChange: (event) => setCandidateQuestion(event.target.value),
            placeholder: "Ask about PTO, benefits, equity, compensation, relocation, or career framework."
          }),
          h("button", { className: "primary-action" }, "Ask")
        )
      )
    ),
    h("section", { className: "audit-panel" },
      h("div", { className: "panel-title-row" }, h("h3", null, "Audit Trail"), h("span", null, "Debuggable AI")),
      h("div", { className: "audit-grid" },
        sampleAudit.map((entry) =>
          h("article", { key: entry.question },
            h("strong", null, entry.question),
            h("span", null, `Docs: ${entry.docs}`),
            h("span", null, `Confidence: ${entry.confidence}`),
            h("span", null, entry.result)
          )
        )
      )
    )
  );
}

createRoot(document.getElementById("root")).render(h(App));
