import React, { useState } from "https://esm.sh/react@18.2.0";
import { createRoot } from "https://esm.sh/react-dom@18.2.0/client";

const h = React.createElement;

const commonDocs = [
  ["Benefits Guide 2024.pdf", "May 20, 2024", "2.4 MB"],
  ["Equity FAQ.pdf", "May 18, 2024", "1.1 MB"],
  ["Stock Option Plan Summary.pdf", "May 18, 2024", "852 KB"],
  ["PTO Policy.pdf", "May 10, 2024", "620 KB"]
];

const candidates = [
  ["AR", "Alex Rivera", "alex.rivera@email.com", "Invited", "2 files", "Completed", "May 21, 2024", "purple"],
  ["SP", "Sarah Patel", "sarah.patel@email.com", "Invited", "No files", "Not added", "May 20, 2024", "gold"],
  ["MC", "Michael Chen", "michael.chen@email.com", "Active", "1 file", "Completed", "May 19, 2024", "teal"],
  ["ET", "Emma Thompson", "emma.thompson@email.com", "Invited", "No files", "Not added", "May 18, 2024", "peach"]
];

const sourceCards = [
  ["pdf", "Equity FAQ - Post-termination exercise", "Page 3"],
  ["doc", "Stock Option Agreement - Section 4.2", "Page 7"]
];

function App() {
  const [screen, setScreen] = useState("dashboard");

  return h(
    "main",
    { className: "app-frame" },
    h(BrandSidebar, { screen, setScreen }),
    screen === "dashboard" ? h(Dashboard) : h(AskScreen)
  );
}

function BrandSidebar({ screen, setScreen }) {
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
      ? h("div", { className: "box-card" }, h("span", { className: "nav-icon folder" }), h("strong", null, "Connected to Box"), h("p", null, "Acme Offer Portal"), h("button", null, "Open in Box", h("span", { className: "external" })))
      : h("div", { className: "disclaimer-card" }, h("span", { className: "shield" }), h("p", null, "Answers are based only on documents provided by Acme. Not legal, tax, or financial advice. Please confirm details with Acme.")),
    screen === "dashboard"
      ? h("div", { className: "user-footer" }, h("span", { className: "avatar sj" }, "SJ"), h("div", null, h("strong", null, "Sarah Johnson"), h("small", null, "sarah@acme.com")), h("span", { className: "chevron" }))
      : h("button", { className: "logout-button" }, h("span", { className: "logout-icon" }), "Log out")
  );
}

function Dashboard() {
  return h(
    "section",
    { className: "workspace" },
    h("header", { className: "workspace-header" }, h("div", null, h("h1", null, "Dashboard"), h("p", null, "Manage common documents and candidate offers.")), h("button", { className: "primary-button" }, h("span", { className: "invite-icon" }), "Invite Candidate")),
    h(
      "section",
      { className: "panel docs-panel" },
      h(PanelIntro, { icon: "folder", title: "Common Documents", text: "These documents are available to all candidates.", actions: ["Open in Box", "Upload Common Docs"] }),
      h("div", { className: "doc-table table" },
        h("div", { className: "table-head" }, h("span", null, "File Name"), h("span", null, "Uploaded"), h("span", null, "Size"), h("span")),
        commonDocs.map((doc) => h("div", { className: "table-row", key: doc[0] }, h("span", null, h("i", { className: "pdf-icon" }), h("strong", null, doc[0])), h("span", null, doc[1]), h("span", null, doc[2]), h("button", { className: "kebab" }, "...")))
      ),
      h("button", { className: "link-button" }, "View all in Box", h("span", { className: "external" }))
    ),
    h(
      "section",
      { className: "panel candidates-panel" },
      h(PanelIntro, { icon: "people", title: "Candidates", text: "Manage candidate-specific offer documents and details." }),
      h("div", { className: "candidate-table table" },
        h("div", { className: "table-head" }, h("span", null, "Candidate"), h("span", null, "Status"), h("span", null, "Offer Docs"), h("span", null, "Offer Details"), h("span", null, "Last Updated"), h("span", null, "Actions")),
        candidates.map(([initials, name, email, status, docs, details, updated, color]) =>
          h("div", { className: "candidate-row table-row", key: email },
            h("span", null, h("i", { className: `avatar ${color}` }, initials), h("span", null, h("strong", null, name), h("small", null, email))),
            h("span", null, h("b", { className: status === "Active" ? "status active" : "status invited" }, status)),
            h("span", { className: docs === "No files" ? "muted-cell" : "" }, docs === "No files" ? h(React.Fragment, null, h("em", null, "-"), h("small", null, "No files")) : h(React.Fragment, null, h("i", { className: "mini-doc" }), docs)),
            h("span", { className: details === "Completed" ? "complete-cell" : "muted-cell" }, h("i"), details),
            h("span", null, updated),
            h("span", { className: "action-cell" }, h("button", null, "Upload Docs"), h("button", null, details === "Completed" ? "Edit Details" : "Add Details"), h("button", { className: "kebab" }, "..."))
          )
        )
      ),
      h("button", { className: "link-button" }, "View all candidates")
    )
  );
}

function PanelIntro({ icon, title, text, actions = [] }) {
  return h("div", { className: "panel-intro" },
    h("span", { className: `panel-icon ${icon}` }),
    h("div", null, h("h2", null, title), h("p", null, text)),
    actions.length ? h("div", { className: "panel-actions" }, h("button", null, actions[0], h("span", { className: "external" })), h("button", { className: "primary-button" }, h("span", { className: "upload-icon" }), actions[1])) : null
  );
}

function AskScreen() {
  return h(
    "section",
    { className: "ask-workspace" },
    h("header", { className: "ask-header" }, h("h1", null, "Ask about your offer"), h("div", { className: "candidate-welcome" }, h("strong", null, "Welcome, Alex"), h("span", null, "A"))),
    h("div", { className: "chat-canvas" },
      h(UserBubble, { text: "What is the exercise window after I leave?", time: "10:23 AM" }),
      h(AssistantAnswer, { text: "Based on the company's Equity FAQ, vested options generally must be exercised within 90 days after leaving the company. Unvested options are typically forfeited when employment ends.", label: "Sources (2)", sources: sourceCards }),
      h(UserBubble, { text: "Can I early exercise my options?", time: "10:27 AM" }),
      h(AssistantAnswer, { text: "I couldn't find a clear answer in the documents provided. The documents don't specify whether early exercise is allowed.\n\nPlease confirm this with Acme or your recruiter.", label: "Sources checked (2)", sources: [["pdf", "Equity FAQ", ""], ["doc", "Stock Option Agreement", ""]] }),
      h("form", { className: "ask-input" }, h("span", { className: "paperclip" }), h("input", { value: "", readOnly: true, placeholder: "Ask anything about your offer, benefits, or equity..." }), h("button", null, h("span", { className: "send-icon" })))
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
      h("div", { className: "source-grid" }, sources.map(([type, name, page]) => h("div", { className: "source-card", key: name }, h("i", { className: type === "pdf" ? "pdf-icon" : "blue-doc-icon" }), h("span", null, h("strong", null, name), page ? h("small", null, page) : null))))
    )
  );
}

createRoot(document.getElementById("root")).render(h(App));
