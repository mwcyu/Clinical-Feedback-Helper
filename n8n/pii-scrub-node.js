// n8n Code node: "PII Scrub"
// Mode: Run Once for All Items · Language: JavaScript

const REMOVED = "[removed]";
const MONTH =
  "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";

// Order matters: emails and labelled IDs run before the generic number rules.
const RULES = [
  {
    name: "email",
    re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
    to: REMOVED,
  },
  {
    name: "titled_patient",
    re: /\b(?:Mr|Mrs|Ms|Miss|Mx)\.?\s+[A-Z][A-Za-z'’-]+(?:\s+[A-Z][A-Za-z'’-]+)?/g,
    to: "the patient",
  },
  {
    name: "titled_doctor",
    re: /\bDr\.?\s+[A-Z][A-Za-z'’-]+(?:\s+[A-Z][A-Za-z'’-]+)?/g,
    to: "the physician",
  },
  {
    name: "labelled_id",
    re: /\b(?:MRN|PHN|chart|health\s*(?:card|number))\s*(?:#|no\.?|number)?\s*[:#]?\s*(?=[A-Z0-9-]*\d)[A-Z0-9-]{4,}/gi,
    to: REMOVED,
  },
  {
    name: "phone",
    re: /(?:\+?1[\s.-]?)?(?:\(\d{3}\)\s?|\b\d{3}[\s.-]?)\d{3}[\s.-]?\d{4}\b/g,
    to: REMOVED,
  },
  { name: "long_number", re: /\b\d{7,}\b/g, to: REMOVED },
  { name: "date_iso", re: /\b\d{4}-\d{1,2}-\d{1,2}\b/g, to: REMOVED },
  {
    name: "date_numeric",
    re: /\b\d{1,2}([\/.-])\d{1,2}\1\d{2,4}\b/g,
    to: REMOVED,
  },
  {
    name: "date_month_day",
    re: new RegExp(
      `\\b${MONTH}\\.?\\s+\\d{1,2}(?:st|nd|rd|th)?(?:,?\\s+\\d{4})?\\b`,
      "g",
    ),
    to: REMOVED,
  },
  {
    name: "date_day_month",
    re: new RegExp(
      `\\b\\d{1,2}(?:st|nd|rd|th)?\\s+(?:of\\s+)?${MONTH}\\b\\.?(?:,?\\s+\\d{4})?`,
      "g",
    ),
    to: REMOVED,
  },
  {
    name: "room_bed",
    re: /\b(?:room|rm|bed|bay)\.?\s*#?\s*\d+[A-Za-z]?\b/gi,
    to: REMOVED,
  },
  {
    name: "postal_code",
    re: /\b[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d\b/g,
    to: REMOVED,
  },
];

// Role phrases the agent may ask for when it declares a term. Anything else becomes [removed].
// Keep in sync with the role list in the system prompt's Privacy section.
const ROLE_RE =
  /^the (?:student|patient|family|physician|preceptor|instructor|charge nurse|nurse|RN|pharmacist|physiotherapist|occupational therapist|social worker|respiratory therapist|care aide|unit clerk|educator|manager|team|staff member)$/i;
const TERM_STOPLIST = new Set([
  "the",
  "a",
  "an",
  "student",
  "patient",
  "nurse",
  "preceptor",
  "instructor",
]);
const DELIVERY_TOKEN = "\u0000DELIVERY_EMAIL\u0000";

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Capitalize a role phrase when it lands at the start of a sentence or list item.
function replacer(to, counts, name) {
  return (...args) => {
    counts[name] = (counts[name] || 0) + 1;
    let str = args[args.length - 1];
    let offset = args[args.length - 2];
    if (typeof str !== "string") {
      str = args[args.length - 2];
      offset = args[args.length - 3];
    }
    if (!/^[a-z]/.test(to)) return to;
    const before = str.slice(0, offset);
    const atStart =
      /(?:^\s*|[.!?]\s+|\n\s*|(?:^|\n)\s*(?:[-*>]|\d+\.)\s+)$/.test(before);
    return atStart ? to[0].toUpperCase() + to.slice(1) : to;
  };
}

function buildTermRules(rawTerms) {
  if (!Array.isArray(rawTerms)) return [];
  return rawTerms
    .map((t) => (typeof t === "string" ? { text: t, as: "" } : t || {}))
    .filter(
      (t) =>
        typeof t.text === "string" &&
        t.text.trim().length >= 2 &&
        !TERM_STOPLIST.has(t.text.trim().toLowerCase()),
    )
    .sort((a, b) => b.text.length - a.text.length)
    .map((t) => ({
      name: "agent_term",
      re: new RegExp(`(?<![\\w])${escapeRegex(t.text.trim())}(?![\\w])`, "gi"),
      to:
        typeof t.as === "string" && ROLE_RE.test(t.as.trim())
          ? t.as.trim().replace(/^the /i, "the ")
          : REMOVED,
    }));
}

function makeScrubber(rules, counts, deliveryEmail) {
  return (text) => {
    if (typeof text !== "string" || text === "") return text;
    let out = text;
    if (deliveryEmail) out = out.split(deliveryEmail).join(DELIVERY_TOKEN);
    for (const rule of rules) {
      rule.re.lastIndex = 0;
      out = out.replace(rule.re, replacer(rule.to, counts, rule.name));
    }
    out = out.replace(/\[removed\](?:[\s,]*\[removed\])+/g, REMOVED); // collapse runs
    if (deliveryEmail) out = out.split(DELIVERY_TOKEN).join(deliveryEmail);
    return out;
  };
}

// Walk the whole state; keep state.delivery.email untouched.
function scrubDeep(value, path, scrub) {
  if (typeof value === "string") return scrub(value);
  if (Array.isArray(value))
    return value.map((v, i) => scrubDeep(v, path.concat(i), scrub));
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (k === "_pii_terms") continue; // never persist the agent's list of removed terms
      const keep = path.length === 1 && path[0] === "delivery" && k === "email";
      out[k] = keep ? v : scrubDeep(v, path.concat(k), scrub);
    }
    return out;
  }
  return value;
}

function scrubItem(json) {
  const counts = {};
  const update = { ...(json.state_update || {}) };
  const termRules = buildTermRules(update._pii_terms);
  delete update._pii_terms;

  const rawEmail = json.state?.delivery?.email;
  const deliveryEmail =
    typeof rawEmail === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)
      ? rawEmail
      : null;

  const scrub = makeScrubber([...termRules, ...RULES], counts, deliveryEmail);
  const state = scrubDeep(json.state || {}, [], scrub);
  const userMessage = scrub(json.user_message);
  const assistantText = scrub(json.assistant_text);

  const replaced = Object.values(counts).reduce((a, b) => a + b, 0);
  if (replaced > 0 || termRules.length > 0) state.pii_flag = true;

  return {
    ...json,
    state,
    state_update: update,
    user_message: userMessage,
    assistant_text: assistantText,
    pii_scrub: { replaced, by_rule: counts, agent_terms: termRules.length },
  };
}

return $input.all().map((item) => ({ json: scrubItem(item.json) }));
