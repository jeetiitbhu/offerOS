import React, { useMemo, useState } from "https://esm.sh/react@18.2.0";
import { createRoot } from "https://esm.sh/react-dom@18.2.0/client";
import { categories, resources } from "./resources.js";

const h = React.createElement;
const submissionStorageKey = "helpNearMeCommunityResources";
const quickPrompts = [
  "Need food",
  "Rent help",
  "Need a clinic",
  "Feeling unsafe",
  "Need work",
  "Legal question"
];
const resultLabels = ["Best first move", "Solid backup", "More support"];

const urgentTerms = [
  "urgent",
  "emergency",
  "tonight",
  "unsafe",
  "danger",
  "shelter",
  "homeless",
  "crisis",
  "suicide",
  "violence",
  "abuse",
  "overdose",
  "hospital",
  "medical emergency",
  "er"
];
const emergencyTerms = [
  "911",
  "suicide",
  "kill myself",
  "hurt myself",
  "overdose",
  "can't breathe",
  "cant breathe",
  "chest pain",
  "bleeding",
  "unconscious",
  "someone is attacking",
  "being attacked",
  "in danger right now",
  "medical emergency"
];
const locationTerms = {
  seattle: "Seattle",
  "west seattle": "Seattle",
  "south seattle": "Seattle",
  "north seattle": "Seattle",
  capitol: "Seattle",
  ballard: "Seattle",
  bellevue: "Bellevue",
  crossroads: "Bellevue",
  factoria: "Bellevue",
  "king county": "King County"
};

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, " ");
}

function classifyNeed(input) {
  const text = normalize(input);
  const matches = Object.entries(categories)
    .map(([key, category]) => {
      const hits = category.keywords.filter((keyword) => text.includes(keyword));
      return { key, label: category.label, hits };
    })
    .filter((match) => match.hits.length > 0);

  if (matches.length > 0) return matches;
  return [{ key: "food", label: categories.food.label, hits: ["general support"] }];
}

function extractLocation(input) {
  const text = normalize(input);
  const found = Object.entries(locationTerms).find(([term]) => text.includes(term));
  return found?.[1] || "Seattle or Bellevue";
}

function hasKnownLocation(input) {
  const text = normalize(input);
  return Object.keys(locationTerms).some((term) => text.includes(term));
}

function isUrgent(input) {
  const text = normalize(input);
  return urgentTerms.some((term) => text.includes(term));
}

function isEmergency(input) {
  const text = normalize(input);
  return emergencyTerms.some((term) => text.includes(term));
}

function detectIntent(input) {
  const emergency = isEmergency(input);
  const urgent = isUrgent(input);

  if (emergency) {
    return {
      level: "emergency",
      label: "Emergency",
      showEmergencySupport: true
    };
  }

  if (urgent) {
    return {
      level: "urgent",
      label: "Urgent",
      showEmergencySupport: false
    };
  }

  return {
    level: "standard",
    label: "Standard",
    showEmergencySupport: false
  };
}

function getAssistantReply(input) {
  if (!input.trim()) return null;

  const needs = classifyNeed(input).map((category) => category.label.toLowerCase());
  const intent = detectIntent(input);

  if (intent.level === "emergency") {
    return "This may be immediate. If someone is in danger or needs medical help now, call 911 first. I will also show crisis and shelter options.";
  }

  if (intent.level === "urgent") {
    return "This sounds time-sensitive. I will prioritize resources that can help with shelter, crisis navigation, or same-day support.";
  }

  if (!hasKnownLocation(input)) {
    return `I can search with what you gave me. Add Seattle, Bellevue, or a neighborhood if you want tighter ${needs.join(" and ")} matches.`;
  }

  return `Got it. I am looking for ${needs.join(" and ")} support near ${extractLocation(input)}.`;
}

function loadCommunityResources() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(submissionStorageKey) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveCommunityResources(nextResources) {
  window.localStorage.setItem(submissionStorageKey, JSON.stringify(nextResources));
}

function scoreResource(resource, selectedCategories, location, input) {
  const selectedKeys = selectedCategories.map((category) => category.key);
  const categoryHits = resource.categories.filter((category) => selectedKeys.includes(category)).length;
  const locationHit =
    location === "Seattle or Bellevue" ||
    resource.location === location ||
    resource.location === "King County" ||
    resource.location === "Washington";
  const urgentBoost = isUrgent(input) && resource.urgent ? 3 : 0;
  const broadBoost = resource.categories.length > 3 ? 0.5 : 0;
  const communityBoost = resource.communitySubmitted ? 1.5 : 0;

  return categoryHits * 4 + (locationHit ? 2 : 0) + urgentBoost + broadBoost + communityBoost;
}

function whyMatched(resource, selectedCategories, location, input, urgentOnly) {
  const selectedKeys = selectedCategories.map((category) => category.key);
  const labels = resource.categories
    .filter((category) => selectedKeys.includes(category))
    .map((category) => categories[category].label);
  const reasons = [];

  if (labels.length) reasons.push(`matches ${labels.join(" and ").toLowerCase()} support`);
  if (resource.location === location) reasons.push(`serves ${location}`);
  if (["King County", "Washington"].includes(resource.location)) reasons.push(`covers the wider ${resource.location} area`);
  if (urgentOnly && resource.urgent) reasons.push("appears in the Urgent Help set");
  if (isUrgent(input) && resource.urgent) reasons.push("is marked for urgent situations");

  return reasons.length ? reasons.join(", ") : "is a broad local resource for this kind of request";
}

function searchResources(input, urgentOnly = false, availableResources = resources) {
  const selectedCategories = classifyNeed(input);
  const location = extractLocation(input);
  const matches = availableResources
    .filter((resource) => !urgentOnly || resource.urgent)
    .map((resource) => ({
      ...resource,
      score: scoreResource(resource, selectedCategories, location, input),
      why: whyMatched(resource, selectedCategories, location, input, urgentOnly)
    }))
    .filter((resource) => resource.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, 3);

  return { selectedCategories, location, matches };
}

function App() {
  const [query, setQuery] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [communityResources, setCommunityResources] = useState(loadCommunityResources);
  const availableResources = useMemo(() => [...communityResources, ...resources], [communityResources]);
  const results = useMemo(() => searchResources(query, urgentOnly, availableResources), [query, urgentOnly, availableResources]);
  const hasAskedForHelp = query.trim().length > 0;
  const assistantReply = getAssistantReply(query);
  const locationKnown = hasKnownLocation(query);
  const intent = detectIntent(query);
  const showEmergencySupport = hasAskedForHelp && intent.showEmergencySupport;

  function addCommunityResource(resource) {
    const nextResources = [resource, ...communityResources];
    setCommunityResources(nextResources);
    saveCommunityResources(nextResources);
  }

  function handleChatSubmit(event) {
    event.preventDefault();
    const nextQuery = chatInput.trim();
    if (!nextQuery) return;

    setQuery(nextQuery);
    setUrgentOnly(isUrgent(nextQuery));
    setChatInput("");
  }

  function useQuickPrompt(prompt) {
    setQuery(prompt);
    setUrgentOnly(isUrgent(prompt));
    setChatInput("");
  }

  function addDetail(detail) {
    const nextQuery = query ? `${query} ${detail}` : detail;
    setQuery(nextQuery);
    setUrgentOnly(isUrgent(nextQuery));
  }

  function startUrgentHelp() {
    const urgentQuery = "I need urgent help with shelter, crisis, medical help, or safety near me.";
    setQuery(urgentQuery);
    setUrgentOnly(true);
  }

  return h(
    "main",
    { className: "app-shell" },
    h(
      "header",
      { className: "topbar" },
      h("div", { className: "brand-row" }, h("span", { className: "brand-mark" }, "H"), h("span", null, "HelpNearMe")),
      h("p", null, "Fast local help, without knowing the right program name.")
    ),
    h(
      "section",
      { className: "chat-section" },
      h("div", { className: hasAskedForHelp ? "chat-card compact" : "chat-card" },
        h("div", { className: "assistant-row" },
          h("span", { className: "assistant-avatar" }, "+"),
          h("div", { className: "assistant-bubble" },
            h("p", null, "What do you need right now?"),
            h("p", null, "Say it simply. Add your city if you can.")
          )
        ),
        hasAskedForHelp
          ? h("div", { className: "user-row" }, h("div", { className: "user-bubble" }, query))
          : null,
        assistantReply
          ? h("div", { className: "assistant-row" },
              h("span", { className: "assistant-avatar small" }, "+"),
              h("div", { className: intent.level !== "standard" ? "assistant-bubble urgent-reply" : "assistant-bubble" }, h("p", null, assistantReply))
            )
          : null,
        h("form", { className: "chat-input-panel", onSubmit: handleChatSubmit },
          h("label", { htmlFor: "chat-input" }, hasAskedForHelp ? "Add detail or ask again" : "Type what is going on"),
          h("textarea", {
            id: "chat-input",
            value: chatInput,
            onChange: (event) => setChatInput(event.target.value),
            placeholder: "Example: Bellevue. Need food today and rent help soon."
          }),
          h("div", { className: "chat-actions" },
            h("button", { className: "primary-button", type: "submit" }, "Find help"),
            h("button", { className: "urgent-button", type: "button", onClick: startUrgentHelp }, "Urgent help")
          )
        ),
        !hasAskedForHelp
          ? h("div", { className: "quick-prompts" },
              quickPrompts.map((prompt) =>
                h("button", { key: prompt, type: "button", onClick: () => useQuickPrompt(prompt) }, prompt)
              )
            )
          : h("div", { className: "quick-prompts compact-prompts" },
              h("button", { type: "button", onClick: () => useQuickPrompt("Food is tight this week") }, "Food"),
              h("button", { type: "button", onClick: () => useQuickPrompt("Rent is stressing me out") }, "Rent"),
              h("button", { type: "button", onClick: startUrgentHelp }, "Urgent"),
              !locationKnown ? h("button", { type: "button", onClick: () => addDetail("Seattle") }, "Seattle") : null,
              !locationKnown ? h("button", { type: "button", onClick: () => addDetail("Bellevue") }, "Bellevue") : null
            )
      )
    ),
    hasAskedForHelp
      ? h(
          "section",
          { className: "results-section" },
          showEmergencySupport ? h(EmergencyPanel) : null,
          h("div", { className: "detected-panel" },
            h("span", null, "I noticed"),
            h("div", { className: "detected-chips" },
              results.selectedCategories.map((item) => h("strong", { key: item.key }, item.label)),
              h("strong", { className: locationKnown ? "" : "soft-chip" }, locationKnown ? results.location : "Location not sure"),
              intent.level !== "standard" ? h("strong", { className: "urgent-chip" }, intent.label) : null
            )
          ),
          h("div", { className: "section-heading" },
            h("h2", null, urgentOnly ? "Let's get you urgent help" : "Your next moves"),
            h("p", null, "Start at the top. If it is not a fit, keep going down the list.")
          ),
          h("div", { className: "results-stack" },
            results.matches.map((resource, index) => h(ResourceCard, { key: resource.id, resource, label: resultLabels[index] }))
          )
        )
      : h(
          "section",
          { className: "empty-state" },
          h("div", null,
            h("h2", null, "No account. No long form."),
            h("p", null, "Type a sentence or tap a shortcut. HelpNearMe will look for nearby food, rent, shelter, work, health, legal, or school support.")
          )
        ),
    h(
      "section",
      { className: "contribute-section" },
      h("div", { className: "section-heading" },
        h("h2", null, "Share a helpful place"),
        h("p", null, "Takes about 30 seconds. Even one name or phone number can help someone nearby.")
      ),
      h("div", { className: "database-strip" },
        h("strong", null, "Demo database"),
        h("span", null, "Saved locally now. Production path: submissions go to a review queue before becoming verified.")
      ),
      h(ResourceSubmissionForm, { onAdd: addCommunityResource }),
      communityResources.length
        ? h("div", { className: "submission-count" }, `${communityResources.length} community resource${communityResources.length === 1 ? "" : "s"} saved on this device.`)
        : null
    )
  );
}

function EmergencyPanel() {
  return h(
    "section",
    { className: "crisis-panel" },
    h("div", null,
      h("span", null, "If this is happening right now"),
      h("h2", null, "Use emergency support first")
    ),
    h("div", { className: "crisis-actions" },
      h("a", { href: "tel:911" }, "Call 911"),
      h("a", { href: "tel:988" }, "Call or text 988"),
      h("a", { href: "tel:211" }, "Call 2-1-1")
    ),
    h("p", null, "For immediate danger, medical emergency, overdose, or violence, call 911. For mental health crisis, call or text 988.")
  );
}

function ResourceCard({ resource, label }) {
  return h(
    "article",
    { className: resource.urgent ? "resource-card urgent" : "resource-card" },
    h("div", { className: "card-topline" },
      h("span", { className: "category-pill" }, resource.categories.map((category) => categories[category].label).join(" / ")),
      h("span", { className: "badge-row" },
        resource.communitySubmitted ? h("span", { className: "source-pill pending" }, "Pending review") : h("span", { className: "source-pill verified" }, "Verified"),
        h("span", { className: "source-pill" }, "Call first"),
        resource.urgent ? h("span", { className: "urgent-pill" }, "Urgent") : null
      )
    ),
    h("p", { className: "result-label" }, label),
    h("h3", null, resource.name),
    h("p", { className: "description" }, resource.description),
    h("div", { className: "next-action-box" },
      h("span", null, "Next best action"),
      h("p", null, resource.nextAction)
    ),
    h("div", { className: "contact-actions" },
      resource.phone !== "Phone not provided"
        ? h("a", { href: `tel:${resource.phone.replace(/[^0-9+]/g, "")}` }, resource.phone)
        : null,
      resource.website !== "Website not provided"
        ? h("a", { href: resource.website, target: "_blank", rel: "noreferrer" }, "Website")
        : h("span", null, "Contact info not confirmed")
    ),
    h(InfoBlock, { title: "Eligibility", children: resource.eligibility }),
    h(InfoBlock, { title: "Documents", children: resource.documents.join(", ") }),
    h("div", { className: "why-box" },
      h("span", null, "Why this matched"),
      h("p", null, resource.why)
    )
  );
}

function InfoBlock({ title, children }) {
  return h("div", { className: "info-block" }, h("span", null, title), h("p", null, children));
}

function ResourceSubmissionForm({ onAdd }) {
  const [form, setForm] = useState({
    name: "",
    location: "Seattle or Bellevue",
    contact: "",
    description: "",
    categories: [],
    urgent: false
  });
  const [saved, setSaved] = useState(false);

  function updateField(field, value) {
    setSaved(false);
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleCategory(category) {
    setSaved(false);
    setForm((current) => {
      const hasCategory = current.categories.includes(category);
      const nextCategories = hasCategory
        ? current.categories.filter((item) => item !== category)
        : [...current.categories, category];

      return { ...current, categories: nextCategories.length ? nextCategories : [category] };
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim() || !form.description.trim()) return;

    const combinedText = `${form.name} ${form.description}`;
    const inferredCategories = classifyNeed(combinedText).map((category) => category.key);

    onAdd({
      id: `community-${Date.now()}`,
      name: form.name.trim(),
      categories: form.categories.length ? form.categories : inferredCategories,
      location: form.location.trim() || "King County",
      description: form.description.trim(),
      eligibility: "Not confirmed yet. Call or visit to ask if you qualify.",
      website: form.contact.trim().startsWith("http") ? form.contact.trim() : "Website not provided",
      phone: form.contact.trim().startsWith("http") ? "Phone not provided" : form.contact.trim() || "Phone not provided",
      documents: ["Ask what to bring"],
      nextAction: form.contact.trim()
        ? "Use the contact info to confirm hours, eligibility, and what to bring."
        : "Search the name online or ask a local service desk to confirm details.",
      urgent: form.urgent,
      communitySubmitted: true
    });

    setForm({
      name: "",
      location: "Seattle or Bellevue",
      contact: "",
      description: "",
      categories: [],
      urgent: false
    });
    setSaved(true);
  }

  return h(
    "form",
    { className: "submission-form", onSubmit: handleSubmit },
    h("div", { className: "submission-note" },
      h("strong", null, "Why share?"),
      h("p", null, "Someone may search this later while stressed, hungry, sick, or without stable housing. A short tip is enough to start.")
    ),
    h("div", { className: "form-grid" },
      h(FormField, {
        label: "Place or program name",
        required: true,
        value: form.name,
        onChange: (value) => updateField("name", value),
        placeholder: "Example: Eastside Food Pantry"
      }),
      h(FormField, {
        label: "Area",
        value: form.location,
        onChange: (value) => updateField("location", value),
        placeholder: "Seattle, Bellevue, or King County"
      })
    ),
    h(FormField, {
      label: "What do they help with?",
      required: true,
      multiline: true,
      value: form.description,
      onChange: (value) => updateField("description", value),
      placeholder: "Example: Free groceries on weekdays. Helps families and walk-ins."
    }),
    h(FormField, {
      label: "Phone or website if you know it",
      value: form.contact,
      onChange: (value) => updateField("contact", value),
      placeholder: "206-000-0000 or https://..."
    }),
    h("div", { className: "category-picker", "aria-label": "Resource categories" },
      Object.entries(categories).map(([key, category]) =>
        h("button", {
          key,
          type: "button",
          className: form.categories.includes(key) ? "category-toggle selected" : "category-toggle",
          onClick: () => toggleCategory(key)
        }, category.label)
      )
    ),
    h("label", { className: "urgent-check" },
      h("input", {
        type: "checkbox",
        checked: form.urgent,
        onChange: (event) => updateField("urgent", event.target.checked)
      }),
      h("span", null, "Include in Urgent Help")
    ),
    h("div", { className: "form-footer" },
      h("p", null, "Saved on this device for the demo. A shared review queue can come next."),
      h("button", { className: "primary-button", type: "submit" }, saved ? "Added" : "Share place")
    )
  );
}

function FormField({ label, value, onChange, placeholder, multiline = false, required = false }) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return h("label", { className: "form-field", htmlFor: id },
    h("span", null, label),
    multiline
      ? h("textarea", {
          id,
          value,
          required,
          onChange: (event) => onChange(event.target.value),
          placeholder
        })
      : h("input", {
          id,
          value,
          required,
          onChange: (event) => onChange(event.target.value),
          placeholder
        })
  );
}

createRoot(document.getElementById("root")).render(h(App));
