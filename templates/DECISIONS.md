# DECISIONS

## Heuristic and ranking
I designed a simple, deterministic scoring model that normalizes the raw feed’s
inconsistent event types into ranked categories:

- `goal` → 5  
- `penalty_missed` → 4  
- `shot_on_target` → 3  
- `card_red` → 3  
- `chance` → 2  
- `card_yellow` → 1  
- `substitution` and other events → 0  

A late-minute bonus of **+1** is applied for events occurring after minute **75**, 
reflecting their higher impact on match context (e.g., late goals or decisive plays).

Ordering rule:
1. Higher score first  
2. Tie-breaker: earlier minute first  
3. Stable ordering for identical scores  

This keeps results deterministic across runs.

---

## Data handling (duplicates, missing fields, out-of-order minutes)
- **Duplicate events**: considered duplicates if they share  
  `(minute, headline, caption)` → these fields uniquely represent an event in the feed.  
  Such duplicates are filtered out.
- **Missing fields**:  
  - Missing image → fallback to `../assets/placeholder.png`  
  - Missing caption/headline → fallback to safe defaults  
- **Out-of-order minutes**:  
  The raw feed is not guaranteed to be sorted.  
  I parse all minutes (string → integer) and rely on my own sorting logic.  

Events with a normalized score of **0** are excluded from highlights.

---

## Pack structure and invariants
I enforce the following guarantees:

- Exactly **one cover page**, always at `pages[0]`.
- Highlight slides are unique and follow deterministic ordering.
- Total pages ≤ 7 (1 cover + up to 6 highlights).
- If no events qualify for highlights, automatically insert an `"info"` page at index 1.
- `created_at` is generated in ISO-8601 format.
- `source` always reflects the actual input file path.
- Slides follow the structure of `schema/story.schema.json`.

All invariants are verified using a Jest test suite.

---

## What I would do with 2 more hours
- Add tunable runtime weighting using `weights.json`.
- Add `--strict` mode: validate the output pack directly against the JSON Schema.
- Add optional AI-generated captions with a small factuality checker (minute, player, score).
- Improve deduplication by incorporating player/team refs rather than headline+caption alone.

