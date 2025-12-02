const fs = require("fs");
const path = require("path");

// ----------------------------------------------------------------------------
// CONFIG
// ----------------------------------------------------------------------------

const INPUT_FILE = path.join(__dirname, "..", "data", "match_events.json");
const OUTPUT_FILE = path.join(__dirname, "..", "out", "story.json");

const WEIGHTS = {
  goal: 5,
  penalty_missed: 4,
  shot_on_target: 3,
  card_red: 3,
  chance: 2,
  card_yellow: 1,
  substitution: 0,
  other: 0
};

const LATE_MINUTE_AFTER = 75;
const LATE_BONUS = 1;
const MAX_PAGES = 7; // 1 cover + up to 6 highlights

const PLACEHOLDER_IMG = "../assets/placeholder.png";

// ----------------------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------------------

// Normalize minute ("90'+3'" → 90, "91" → 91, "0" → 0)
function parseMinute(minStr) {
  if (!minStr) return 0;
  const num = parseInt(minStr.replace(/[^0-9]/g, ""), 10);
  return isNaN(num) ? 0 : num;
}

// Normalize event types so the ranking system can understand them
function normalizeType(t) {
  if (!t) return "other";
  t = t.toLowerCase();

  if (t.includes("goal")) return "goal";                  // "penalty goal"
  if (t.includes("shot")) return "shot_on_target";
  if (t.includes("red")) return "card_red";
  if (t.includes("yellow")) return "card_yellow";
  if (t.includes("chance")) return "chance";
  if (t.includes("substitute")) return "substitution";

  if (t.includes("penalty missed")) return "penalty_missed";
  if (t.includes("penalty won")) return "chance";
  if (t.includes("penalty conceded")) return "chance";

  // Irrelevant events: corner, added time, kick-off, etc.
  return "other";
}

function scoreEvent(ev) {
  const base = WEIGHTS[ev.type] ?? 0;
  const late = ev.minute > LATE_MINUTE_AFTER ? LATE_BONUS : 0;
  return base + late;
}

// ----------------------------------------------------------------------------
// LOAD + PREPROCESS EVENTS
// ----------------------------------------------------------------------------

function loadEvents() {
  try {
    const raw = JSON.parse(fs.readFileSync(INPUT_FILE, "utf-8"));

    const msgBlock = raw.messages?.[0]?.message;
    if (!Array.isArray(msgBlock)) {
      throw new Error("No events found in messages[0].message");
    }

    return msgBlock.map(ev => ({
      id: ev.id,
      rawType: ev.type,
      type: normalizeType(ev.type),
      minute: parseMinute(ev.minute),
      comment: ev.comment || "",
      period: ev.period || "",
      score: 0 // placeholder, will compute later
    }));
  } catch (err) {
    console.error("❌ Failed to load match events:", err);
    process.exit(1);
  }
}

// ----------------------------------------------------------------------------
// SLIDE BUILDERS
// ----------------------------------------------------------------------------

function buildCoverSlide() {
  return {
    type: "cover",
    headline: "Match Highlights",
    image: PLACEHOLDER_IMG
  };
}

function buildHighlightSlide(ev, explanation) {
  return {
    type: "highlight",
    minute: ev.minute,
    headline: ev.rawType.toUpperCase(),
    caption: ev.comment,
    image: PLACEHOLDER_IMG,
    explanation
  };
}

function buildFallbackSlide() {
  return {
    type: "info",
    headline: "No Highlights Available",
    body: "No significant events met the highlight criteria."
  };
}

// ----------------------------------------------------------------------------
// MAIN STORY BUILDER
// ----------------------------------------------------------------------------

function generateStoryPack(events) {
  // Add scores
  const scored = events.map(ev => ({
    ...ev,
    score: scoreEvent(ev)
  }));

  // Keep only meaningful events
  const highlights = scored.filter(ev => ev.score > 0);

  // Sort by score desc, minute asc
  highlights.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.minute - b.minute;
  });

  // Respect max pages
  const limited = highlights.slice(0, MAX_PAGES - 1);

  // Build pages
  const pages = [];
  pages.push(buildCoverSlide());

  if (limited.length === 0) {
    pages.push(buildFallbackSlide());
  } else {
    for (const ev of limited) {
      const explanation = `base=${WEIGHTS[ev.type] ?? 0}` +
        (ev.minute > LATE_MINUTE_AFTER ? ` + late_bonus=${LATE_BONUS}` : "");

      pages.push(buildHighlightSlide(ev, explanation));
    }
  }

  return {
    story_id: "story_" + Date.now(),
    title: "Match Highlights — Celtic vs Kilmarnock",
    pages,
    source: "../data/match_events.json",
    created_at: new Date().toISOString(),
    metrics: {
      total_events: events.length,
      highlights: limited.length,
      goals: events.filter(e => e.type === "goal").length
    }
  };
}

// ----------------------------------------------------------------------------
// SAVE OUTPUT
// ----------------------------------------------------------------------------

function saveStory(pack) {
  try {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(pack, null, 2), "utf-8");
    console.log("✅ Story Pack generated at out/story.json");
  } catch (err) {
    console.error("❌ Failed to write story.json:", err);
  }
}

// ----------------------------------------------------------------------------
// MAIN
// ----------------------------------------------------------------------------

function main() {
  console.log("🔄 Building Story Pack...");
  const events = loadEvents();
  const pack = generateStoryPack(events);
  saveStory(pack);
}

main();
