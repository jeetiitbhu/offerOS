import React from "https://esm.sh/react@18.2.0";
import { createRoot } from "https://esm.sh/react-dom@18.2.0/client";

const h = React.createElement;

const candidate = {
  name: "Alex Rivera",
  role: "Senior Software Engineer",
  email: "alex.rivera@gmail.com",
  phone: "(415) 555-0198",
  location: "San Francisco, CA (Remote)",
  status: "Offer Sent",
  details: [
    ["Application ID", "CND-2024-0876"],
    ["Source", "LinkedIn"],
    ["Applied On", "Apr 18, 2024"],
    ["Current Stage", "Offer Sent"],
    ["Expected Start", "Jun 17, 2024"],
    ["Recruiter", "Jamie Lee"]
  ]
};

const documents = [
  ["Resume.pdf", "Uploaded Apr 18, 2024"],
  ["Portfolio.pdf", "Uploaded Apr 18, 2024"],
  ["Degree.pdf", "Uploaded Apr 18, 2024"],
  ["Offer Letter - Draft.pdf", "Uploaded May 10, 2024"]
];

const chat = [
  {
    initials: "JR",
    name: "Jamie Lee",
    type: "Recruiter",
    text: "Thanks Alex! I'll sync with the team and follow up soon.",
    date: "May 10, 2024",
    time: "10:15 AM"
  },
  {
    initials: "AR",
    name: "Alex Rivera",
    type: "Candidate",
    text: "Sounds good, thank you!",
    date: "May 9, 2024",
    time: "4:32 PM"
  },
  {
    initials: "JR",
    name: "Jamie Lee",
    type: "Recruiter",
    text: "Great meeting you today! We'll be in touch with next steps.",
    date: "May 9, 2024",
    time: "11:02 AM"
  }
];

const concerns = [
  ["Compensation", "High", "high"],
  ["Equity", "Medium", "medium"],
  ["Remote Work", "Low", "low"]
];

const signals = [
  ["GitHub active", "Pushed 7 commits in the last 30 days"],
  ["LinkedIn updated", "Added 2 new roles in the past 60 days"],
  ["Blog post about AI infra", "Published on May 6, 2024"]
];

const actions = [
  ["calendar", "Schedule hiring manager call"],
  ["document", "Send equity explainer"],
  ["building", "Highlight remote policy"]
];

function App() {
  return h(
    "main",
    { className: "page-shell" },
    h(Topbar),
    h(
      "div",
      { className: "profile-layout" },
      h(
        "section",
        { className: "left-column" },
        h(CandidateInfo),
        h(UploadedDocuments),
        h(ChatHistory),
        h(PendingResponse)
      ),
      h(
        "aside",
        { className: "right-column" },
        h("div", { className: "rail-title" }, h(TrendIcon), h("h2", null, "HR Intelligence")),
        h(ConcernSignals),
        h(CandidateSignals),
        h(ClosingActions),
        h(OfferHealth)
      )
    )
  );
}

function Topbar() {
  return h(
    "header",
    { className: "topbar" },
    h("button", { className: "icon-button menu-button", "aria-label": "Menu" }, h("span"), h("span"), h("span")),
    h("div", { className: "hr-logo" }, "HR"),
    h("h1", null, "Candidate Profile \u2014 Alex Rivera"),
    h("span", { className: "status-badge" }, candidate.status),
    h("div", { className: "topbar-spacer" }),
    h("button", { className: "icon-button search-icon", "aria-label": "Search" }),
    h("button", { className: "icon-button bell-icon", "aria-label": "Notifications" }),
    h("div", { className: "avatar-chip" }, "HR")
  );
}

function CandidateInfo() {
  return h(
    Card,
    { className: "candidate-card" },
    h("h2", null, "Candidate Information"),
    h(
      "div",
      { className: "candidate-info-grid" },
      h("div", { className: "profile-avatar", "aria-hidden": "true" }, h("span"), h("i")),
      h(
        "div",
        { className: "contact-block" },
        h("h3", null, candidate.name),
        h("p", null, candidate.role),
        h(ContactLine, { icon: "mail", value: candidate.email }),
        h(ContactLine, { icon: "phone", value: candidate.phone }),
        h(ContactLine, { icon: "pin", value: candidate.location })
      ),
      h(
        "dl",
        { className: "detail-list" },
        candidate.details.map(([label, value]) =>
          h(React.Fragment, { key: label }, h("dt", null, label), h("dd", null, value))
        )
      )
    )
  );
}

function ContactLine({ icon, value }) {
  return h("div", { className: "contact-line" }, h("span", { className: `mini-icon ${icon}` }), h("span", null, value));
}

function UploadedDocuments() {
  return h(
    Card,
    null,
    h("h2", null, "Uploaded Documents"),
    h(
      "div",
      { className: "document-grid" },
      documents.map(([name, uploaded], index) =>
        h(
          "article",
          { className: "document-tile", key: name },
          h("span", { className: "file-icon" }),
          h("div", null, h("strong", null, name), h("small", null, uploaded)),
          index === documents.length - 1 ? h("button", null, "View") : null
        )
      )
    )
  );
}

function ChatHistory() {
  return h(
    Card,
    null,
    h("h2", null, "Chat History (Preview)"),
    h(
      "div",
      { className: "chat-list" },
      chat.map((item) =>
        h(
          "article",
          { className: "chat-row", key: `${item.initials}-${item.time}` },
          h("div", { className: "initial-avatar" }, item.initials),
          h("div", { className: "chat-message" }, h("strong", null, `${item.name} (${item.type})`), h("p", null, item.text)),
          h("div", { className: "chat-meta" }, h("span", null, item.date), h("span", null, item.time))
        )
      )
    ),
    h("button", { className: "text-link" }, "View full conversation")
  );
}

function PendingResponse() {
  return h(
    Card,
    null,
    h("h2", null, "Pending HR Response"),
    h(
      "div",
      { className: "pending-row" },
      h("div", { className: "response-icon" }),
      h(
        "div",
        { className: "pending-copy" },
        h("h3", null, "Compensation Clarification"),
        h("p", null, "Alex requested confirmation on base salary and equity details."),
        h("span", null, "Requested May 10, 2024")
      ),
      h("button", { className: "outline-button" }, "Respond")
    )
  );
}

function ConcernSignals() {
  return h(
    RailCard,
    { title: "Concern Signals" },
    h(
      "div",
      { className: "concern-list" },
      concerns.map(([label, value, tone]) =>
        h("div", { className: "concern-row", key: label }, h("span", null, label), h("strong", { className: tone }, value))
      )
    )
  );
}

function CandidateSignals() {
  return h(
    RailCard,
    { title: "Candidate Signals from Apify" },
    h(
      "div",
      { className: "signal-list" },
      signals.map(([title, text]) =>
        h("article", { className: "signal-row", key: title }, h("span"), h("div", null, h("strong", null, title), h("p", null, text)))
      )
    )
  );
}

function ClosingActions() {
  return h(
    RailCard,
    { title: "Suggested Closing Actions" },
    h(
      "div",
      { className: "action-list" },
      actions.map(([icon, text]) =>
        h("div", { className: "action-row", key: text }, h("span", { className: `action-icon ${icon}` }), h("p", null, text))
      )
    )
  );
}

function OfferHealth() {
  return h(
    RailCard,
    { title: "Offer Health" },
    h(
      "div",
      { className: "health-row" },
      h("div", { className: "health-ring" }, h("strong", null, "72%")),
      h("div", null, h("strong", null, "Good"), h("p", null, "Offer is healthy. Monitor compensation concerns."))
    )
  );
}

function Card({ children, className = "" }) {
  return h("section", { className: `card ${className}`.trim() }, children);
}

function RailCard({ title, children }) {
  return h("section", { className: "rail-card" }, h("div", { className: "rail-card-title" }, h("h3", null, title), h("span", null, "i")), children);
}

function TrendIcon() {
  return h("span", { className: "trend-icon" }, h("i"), h("i"), h("i"));
}

createRoot(document.getElementById("root")).render(h(App));
