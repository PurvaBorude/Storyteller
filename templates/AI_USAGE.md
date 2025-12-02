# AI USAGE

## Where AI helped
AI was used as an auxiliary tool to:
- accelerate understanding of the task specification and schema expectations  
- scaffold the initial structure for the builder script and test suite  
- produce boilerplate Markdown (README, DECISIONS, AI_USAGE)  
- refine naming, code organization, and invariant coverage

## Prompts or strategies that worked
- Asking for clarifications of schema constraints  
- Requesting code scaffolds rather than full implementations  
- Using AI to validate that my design decisions aligned with invariants  
- Iterative refinement: generating a draft → reviewing → modifying  

## Verification steps (tests, assertions, manual checks)
- Manual validation by loading `out/story.json` in `preview/index.html`  
- Running Jest tests to confirm cover placement, ordering, deduplication, and field completeness  
- Reviewing the output JSON to ensure consistency and determinism  
- Re-running generation multiple times to confirm stable results  

## Cases where I chose **not** to use AI and why
- The normalization rules, scoring heuristic, and deduplication strategy were defined manually.  
- Logical decisions (how to map raw feed types, how to enforce invariants) were based on my own reasoning rather than AI output.  
- Final testing and validation steps were performed manually to ensure reliability.

