# Fluid Git — A Deterministic In-Memory Git Engine & Physics Learning Lab

Most Git learning tools show you an animation of what Git supposedly does. Fluid Git is built on a **deterministic in-memory Git engine inspired by Git's content-addressable object store, DAG, index, and working-tree model** — real commits, real branches, real 3-way merges, and real line-level conflicts.

Built to make Git state visible while you learn it: commands mutate a shared repository model, and the graph, terminal, inspectors, and labs all observe the same state. Fluid Git replaces that with a physics-driven, spring-animated interface and genuinely progressive difficulty, backed by a Git engine tested against real edge cases.

---

## What makes this real, not a mockup

Core Git operations are implemented against a shared in-memory repository model and covered by automated tests:

- **Commits, branches, detached HEAD** — full SHA-addressable object store (Blobs, Trees, Commits) and ref pointers.
- **Merge** — accurately distinguishes fast-forward, 3-way, and already-up-to-date outcomes via a topological Lowest Common Ancestor (LCA) algorithm (tested against multi-branch diamond DAGs).
- **Genuine merge conflicts** — real line-level 3-way array diffing. Non-overlapping line modifications auto-merge cleanly; overlapping modifications halt and generate standard conflict markers. The Stage 4 conflict studio sets up real divergent branches and lets the engine detect the collision upon `git merge`.
- **Rebase, reset (--soft/--mixed/--hard), stash, cherry-pick, revert, reflog** — operate through repository snapshots, refs, trees, and working files.

**40 automated test cases** cover the engine invariants, command parser edge cases (unclosed quotes, flag bundling, whitespace), and curriculum integrity (every lesson's initial state and completion validator are independently verified). The repository is configured for TypeScript strict mode and a production Next.js build.

---

## How the learning path works

Four progressive stages, not one flat sandbox:

1. **Stage 1: Fundamentals** — the three zones, staging, committing. Button-driven where possible, so you're not required to know syntax to learn concepts.
2. **Stage 2: Branching & Merging** — real branch divergence and merges.
3. **Stage 3: Undoing & Precision** — reset modes, amending, the operations people are usually afraid to touch.
4. **Stage 4: Remotes & Recovery** — includes the Merge Conflict Resolution Studio, where a real conflict is triggered by your own `git merge` command, not a canned demo.

Every lesson includes a plain-language goal, progressive hints, the *why* behind the command (not just the *what*), a real-world context for when you'd actually use it, and a proactively-flagged common mistake — built specifically to catch the confusion points a genuine beginner hits, not just the command reference itself.

---

## Beyond the curriculum

- **Playground** — free-form sandbox against the same real engine.
- **Explorer** — plumbing/internals inspector, command comparisons, an emergency-recovery wizard for "I broke something" scenarios.
- **AI Coach** — optional, context-aware help. Bring your own OpenAI/Anthropic/Gemini key, or use the built-in free tier (rate-limited to protect shared quota). If no AI is configured at all, or a request fails, it falls back to real local pedagogical advice — the tool is never dependent on an external API to be useful.
- **Theming** — a curated set of named themes (Linear, GitHub, JetBrains-inspired, plus a few standalone options), not an infinite customizer.

---

## Tech stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript (strict) · Zustand for state · Framer Motion for physics-based, spring-driven animation · Tailwind CSS · Vitest for the engine/parser/curriculum test suites.

No database, no required login, no paid dependencies. The only external calls are optional, user-configured AI provider requests.

---

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

To use the AI Coach with your own key, or to use the built-in free tier, configure it in-app via the settings modal — no `.env` setup required to use the rest of the tool.

Run the test suite:
```bash
npm run test
```

---

## Project structure

```
core/
  engine/        — the in-memory Git simulation: commits, branches, merge, rebase, reset, stash
  parser/        — command lexer/parser for the terminal input
  curriculum/    — lessons, scenarios, glossary, command reference data
  ai/            — AI coach prompt building and provider gateway
app/             — routes: landing, curriculum, playground, explorer, help, roadmap
components/      — canvas rendering, terminal, labs (conflict resolver, interactive rebase), UI
__tests__/       — engine correctness, parser edge cases, curriculum integrity
```

---

## Status

Core engine, curriculum (4 stages), playground, AI coach, and theming are complete and tested. Known area for future work: the in-memory AI rate limiter resets per server instance, so it's a soft protection, not a hard guarantee, under serverless deployment — fine for current scale, worth revisiting with a shared store if usage grows.