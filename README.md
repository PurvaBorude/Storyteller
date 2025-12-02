# Story Pack Generator — Hiring Task

This project is a small CLI tool that ingests raw match events and produces a
**Story Pack** (a JSON bundle of Pages) compatible with the provided static
preview.  
It follows the requirements specified in the Storyteller junior developer task.

---

## 📦 Features

- Converts `data/match_events.json` → `out/story.json`
- Normalizes raw event types into ranked categories
- Applies a simple, deterministic heuristic:
  - goal = 5  
  - penalty_missed = 4  
  - shot_on_target = 3  
  - card_red = 3  
  - chance = 2  
  - card_yellow = 1  
  - substitution/other = 0  
  - late-minute bonus (+1) after minute 75
- Produces a valid Story Pack containing:
  - A **cover** page at index 0
  - Up to 6 highlight pages (stable ordering, no duplicates)
  - A fallback **info** page if no highlights exist
- Output validated through Jest tests and preview UI
- Deterministic and stable for identical inputs

---

## 🛠 Requirements

- **Node.js** (v18+ recommended)  
  https://nodejs.org

- **npm** (bundled with Node)

No external services or servers are required.

---

## 🚀 Installation

From the project root:

```bash
npm install
```

This installs development dependencies (including Jest).

---

## ▶️ Generating the Story Pack

Run:

```bash
node src/buildStory.js
```

This reads:

```
data/match_events.json
```

and generates:

```
out/story.json
```

The tool is fully deterministic: repeated executions with the same input
produce identical output.

---

## 👀 Previewing the Story Pack

1. Open `preview/index.html` in your browser  
   (double-click or run `start preview/index.html` on Windows)

2. Click **Choose File**

3. Select:
   ```
   out/story.json
   ```

The preview displays:
- Navigation arrows  
- Page dots  
- Cover, highlight, and fallback pages  
- Headline, caption, image, and ranking explanation

No web server is needed; the preview runs locally.

---

## 🧪 Running Tests

A Jest test suite verifies the core invariants:

```bash
npm test
```

The tests confirm:

- required top-level fields exist  
- exactly one cover page at index 0  
- unique highlight pages  
- deterministic ordering  
- valid ISO timestamp  
- correct `source` field  
- ranking behavior  
- placeholder images  

All tests should pass.

---

## 📁 Project Structure

```
project-root/
│
├── src/
│   └── buildStory.js        # main builder logic
│
├── data/
│   └── match_events.json    # input feed
│
├── out/
│   └── story.json           # generated output
│
├── preview/
│   └── index.html           # static preview viewer
│
├── schema/
│   └── story.schema.json    # output schema
│
├── tests/
│   ├── story.test.js        # Jest tests for invariants
│   └── invariants.md        # required invariants (task spec)
│
├── templates/
│   ├── DECISIONS.md         # heuristic documentation
│   ├── AI_USAGE.md          # AI usage summary
│   └── EVALS.md             # optional (unused)
│
└── README.md                # this file
```

---

## 🧩 Optional (Not Implemented)

The following stretch items were intentionally left out, as they are not
required to complete the task:

- tunable ranking via `weights.json`
- AI-generated captions
- strict/lenient modes
- performance benchmarking

---

## ✔ Completion Notes

This implementation:

- Satisfies all required invariants  
- Produces a valid Story Pack compatible with the preview  
- Includes a deterministic heuristic, deduplication, and fallback handling  
- Provides a full Jest suite and supporting documentation  

