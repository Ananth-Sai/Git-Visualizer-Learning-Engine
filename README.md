<div align="center">

# 🌊 Fluid Git
### Physics-Driven In-Memory Git Engine & Interactive Learning Lab

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.2%20(Turbopack)-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x%20Strict-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Tests Passing](https://img.shields.io/badge/Vitest-40%2F40%20Passing%20(100%25)-44A833?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-9945FF?style=for-the-badge)](./LICENSE)

<p align="center">
  <b>A zero-latency, topological Git simulation where commands mutate a real in-memory content-addressable DAG.</b><br/>
  Real commits · Real branches · Real 3-way LCA merges · Real line-level conflict resolution.
</p>

[✨ Explore Curriculum](https://github.com/Ananth-Sai/Git-Visualizer-Learning-Engine) • [🛠️ Interactive Playground](https://github.com/Ananth-Sai/Git-Visualizer-Learning-Engine) • [🔍 Command Explorer](https://github.com/Ananth-Sai/Git-Visualizer-Learning-Engine) • [📖 Smart Help](https://github.com/Ananth-Sai/Git-Visualizer-Learning-Engine)

---

</div>

## 💡 What Makes Fluid Git Different?

Most Git visualizers show pre-baked animations of what Git conceptually does. **Fluid Git** is powered by a **deterministic in-memory Git state engine** modeled directly after Git's internal architecture:

```text
  ┌───────────────────────┐       ┌───────────────────────┐       ┌───────────────────────┐
  │   WORKING DIRECTORY   │  ──>  │     STAGING AREA      │  ──>  │     OBJECT STORE      │
  │    (Unstaged Files)   │       │   (Index / .git/idx)  │       │ (Blobs, Trees, Commits)│
  └───────────┬───────────┘       └───────────┬───────────┘       └───────────┬───────────┘
              │                               │                               │
              └───────────────────────────────┼───────────────────────────────┘
                                              ▼
                              ┌───────────────────────────────┐
                              │     PURE GIT STATE REDUCER    │
                              │     (Deterministic Replay)    │
                              └───────────────┬───────────────┘
                                              │
                 ┌────────────────────────────┴────────────────────────────┐
                 ▼                                                         ▼
  ┌─────────────────────────────┐                           ┌─────────────────────────────┐
  │    PHYSICS COMMIT GRAPH     │                           │   INTERACTIVE TERMINAL &    │
  │ (Framer Motion Spring DAG)  │                           │   4-ZONE PLUMBING VIEWER    │
  └─────────────────────────────┘                           └─────────────────────────────┘
```

Every command typed into the simulated terminal mutates a single shared state store: the DAG graph, 3-zone staging visualizer, object inspectors, and lesson validators all react in real time.

---

## ⚡ Core Feature Showcase

| Module | Icon | Capabilities |
| :--- | :---: | :--- |
| **Physics Commit Graph** | 🌌 | Spring-driven SVG canvas, auto-branch routing, detached HEAD markers, 2-parent merge diamonds, and commit SHA inspection tooltips. |
| **Deterministic Engine** | ⚙️ | Full object store (`Blob`, `Tree`, `Commit`, `Tag`), ref pointers, `HEAD` tracking, and reflog movement history. |
| **3-Way Merge Engine** | 🔀 | Topological **Lowest Common Ancestor (LCA)** search across multi-branch diamond DAGs. Accurate fast-forward vs 3-way merge resolution. |
| **Merge Conflict Studio** | 💥 | True line-level array diffing. Overlapping modifications trigger standard conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) with interactive inline resolvers. |
| **Command Explorer** | 🔍 | 5 interactive tabs: **Flag Builder**, **Comparisons** (`merge` vs `rebase`), **Recipe Scenarios**, **Emergency Triage**, and **4-Zone Plumbing**. |
| **Smart Help & Catalog** | 📖 | Searchable cheat sheet with live command chips, syntax breakdown, safety risk ratings, and topology diagrams. |
| **Interactive Roadmap** | 🗺️ | 22-station learning progression flowchart connecting fundamentals to advanced history surgery. |
| **Context AI Coach** | 🤖 | Built-in Gemini 3.7 multi-model fallback chain with client-side BYOK support (OpenAI / Anthropic) and rate-limited free tier. |
| **Theme Suite** | 🎨 | Curated dark & developer themes: *Linear*, *GitHub Dark*, *JetBrains*, *Tokyo Night*, *Espresso*, and *Nord*. |

---

## 📚 Pedagogical Curriculum (4 Progressive Stages)

```text
Stage 1: Fundamentals  ──>  Stage 2: Branch & Merge  ──>  Stage 3: History Surgery  ──>  Stage 4: Remotes & Conflicts
[Staging & Commits]         [Divergent DAGs & LCA]        [Soft/Hard Resets & Stash]     [Conflict Studio & Remotes]
```

1. **Stage 1: Repository Fundamentals**
   * The 3-Zone Mental Model (Working Tree ➔ Index ➔ Commit History)
   * Staging files with `git add`, snapshotting with `git commit -m`
   * Inspecting repository state with `git status` and `git log`
2. **Stage 2: Branching & Branch Topology**
   * Creating and switching branches (`git branch`, `git switch`, `git checkout -b`)
   * Fast-Forward merges vs recursive 3-way merge commits
   * Deleting merged branches and tracking `HEAD` pointers
3. **Stage 3: History Surgery & Undoing Mistakes**
   * Dissecting `git reset` modes: `--soft` vs `--mixed` vs `--hard`
   * Temporary work preservation with `git stash` and `git stash pop`
   * Reverting safe public history with `git revert`
4. **Stage 4: Remote Operations & Conflict Resolution**
   * Simulating remotes: `git fetch`, `git pull origin main`, `git push origin main`
   * Real-time merge conflict handling in the dedicated Conflict Studio
   * History surgery with `git cherry-pick` and `git reflog`

---

## 🧪 Comprehensive Automated Test Suite

Fluid Git is thoroughly tested with **Vitest** to ensure zero state regressions or invalid Git operations:

```bash
✓ __tests__/command-parser.test.ts (15 tests)
  - Tokenizes arguments, quoted strings with spaces, flag bundling (-am), and bad syntax
✓ __tests__/git-engine.test.ts (21 tests)
  - Commits, branch creation, fast-forward merges, diamond LCA 3-way merges
  - Soft, mixed, and hard resets, revert commits, stash and pop stacks
✓ __tests__/curriculum-integrity.test.ts (4 tests)
  - Validates all stage lesson objectives, initial state builders, and completion rules

Test Files  3 passed (3)
     Tests  40 passed (40)
  Duration  1.17s
```

---

## 🛠️ Technology Stack

* **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
* **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict Mode, 100% Type-Safe)
* **UI & Components:** [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
* **State Management:** [Zustand](https://github.com/pmndrs/zustand)
* **Animation & Physics:** [Framer Motion](https://www.framer.com/motion/)
* **Test Runner:** [Vitest](https://vitest.dev/)
* **AI Integration:** Google Gemini API (with optional OpenAI / Anthropic BYOK proxy)

---

## 🚀 Quick Start (Local Setup)

### 1. Clone the repository
```bash
git clone https://github.com/Ananth-Sai/Git-Visualizer-Learning-Engine.git
cd Git-Visualizer-Learning-Engine
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run automated tests
```bash
npm test
```

### 5. Create a production build
```bash
npm run build
npm run start
```

---

## 🔒 Security & Privacy Notice

* **Zero Secret Logging:** Your API keys (Gemini, OpenAI, Anthropic) are stored strictly in client-side `localStorage` and sent over HTTPS only when interacting with the AI Coach.
* **Fallback Guarantee:** The entire simulation, learning tracks, canvas animations, and command parsers function **100% offline** without requiring any API keys or network connection.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for more details.

---

<div align="center">
  <sub>Built with ❤️ for developers and students mastering Git topology.</sub>
</div>