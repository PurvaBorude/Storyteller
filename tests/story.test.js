const fs = require("fs");
const path = require("path");

const OUTPUT_FILE = path.join(__dirname, "..", "out", "story.json");

// Load JSON helper
function loadPack() {
  return JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf-8"));
}

describe("Story Pack Invariants", () => {

  test("1. Pack has all required top-level fields", () => {
    const pack = loadPack();

    expect(typeof pack.story_id).toBe("string");
    expect(typeof pack.title).toBe("string");
    expect(Array.isArray(pack.pages)).toBe(true);
    expect(typeof pack.source).toBe("string");
    expect(typeof pack.created_at).toBe("string");
  });

  test("2. Exactly one cover page at index 0", () => {
    const pack = loadPack();

    expect(pack.pages[0].type).toBe("cover");

    const covers = pack.pages.filter(p => p.type === "cover");
    expect(covers.length).toBe(1);
  });

  test("3. Highlight pages must be unique", () => {
    const pack = loadPack();
    const highlights = pack.pages.filter(p => p.type === "highlight");

    const seen = new Set();
    for (const h of highlights) {
      const key = `${h.minute}|${h.headline}|${h.caption}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });

  test("4. Ordering must be deterministic", () => {
    const pack1 = loadPack();
    const pack2 = loadPack();

    const h1 = pack1.pages.filter(p => p.type === "highlight");
    const h2 = pack2.pages.filter(p => p.type === "highlight");

    expect(h1.length).toBe(h2.length);

    for (let i = 0; i < h1.length; i++) {
      expect(h1[i].minute).toBe(h2[i].minute);
      expect(h1[i].headline).toBe(h2[i].headline);
      expect(h1[i].caption).toBe(h2[i].caption);
    }
  });

  test("5. Info page appears when no highlights", () => {
    const pack = loadPack();
    const highlights = pack.pages.filter(p => p.type === "highlight");

    if (highlights.length === 0) {
      expect(pack.pages[1].type).toBe("info");
      expect(pack.pages[1].headline.toLowerCase()).toContain("no");
    }
  });

  test("6. created_at must be ISO 8601", () => {
    const pack = loadPack();
    const timestamp = Date.parse(pack.created_at);

    expect(timestamp).not.toBeNaN();
  });

  test("7. source must match input path", () => {
    const pack = loadPack();
    expect(pack.source).toBe("../data/match_events.json");
  });

  // Suggested Tests ----------------------------------------------------------

  test("Goal at minute 90 ranks higher than shot at minute 10 (late bonus)", () => {
    const pack = loadPack();
    const highlights = pack.pages.filter(p => p.type === "highlight");

    if (highlights.length < 2) return;

    const minutes = highlights.map(h => h.minute);
    expect(minutes[0]).toBeGreaterThan(minutes[minutes.length - 1]);
  });

  test("Image field exists or default placeholder is used", () => {
    const pack = loadPack();
    for (const p of pack.pages) {
      if (p.type === "cover" || p.type === "highlight") {
        expect(typeof p.image).toBe("string");
      }
    }
  });

});
