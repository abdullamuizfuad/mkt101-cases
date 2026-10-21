# Graph Report - mkt101-cases  (2026-10-21)

## Corpus Check
- Corpus is ~33,507 words - fits in a single context window. You may not need a graph.

## Summary
- 93 nodes · 132 edges · 9 communities (7 shown, 2 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.84)
- Token cost: 269,734 input · 0 output

## Community Hubs (Navigation)
- Soneva Concepts and Activities
- Routing and Sign-in Pages
- Practice Paper Engine
- STO Case and Channels
- Case Pages and Exam Data
- Sign-in Setup Guide
- MNU Logo and Brand
- Question Bank Data

## God Nodes (most connected - your core abstractions)
1. `STO Retail: Reaching Every Island (case)` - 12 edges
2. `renderExam() case Section C practice` - 10 edges
3. `Soneva Fushi: Selling the Dream, Protecting the Reef (case)` - 10 edges
4. `renderCase()` - 9 edges
5. `R renderer registry` - 9 edges
6. `renderEssays() Section B` - 8 edges
7. `route() hash router` - 7 edges
8. `renderHome()` - 7 edges
9. `renderPaper() practice paper view` - 6 edges
10. `S (localStorage wrapper, mkt101_ prefix)` - 5 edges

## Surprising Connections (you probably didn't know these)
- `mkt101-cases Repository` --conceptually_related_to--> `Student Sign-in Setup`  [INFERRED]
  README.md → tools/README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Interactive activity renderers dispatched by R[p.type]** — index_r, index_r_classify, index_r_builder, index_r_channel, index_r_atmos, index_r_intensity, index_r_order, index_r_grid, index_r_claims, index_renderact [EXTRACTED 1.00]
- **Practice paper sections A/B/C flow** — index_renderpaper, index_rendermcq, index_renderessays, index_rendersecc, index_renderexam [EXTRACTED 1.00]
- **Student sign-in gate flow** — index_route, index_renderlanding, index_renderverify, index_me, index_saveme, index_signout, index_apps_script_class_list_check [EXTRACTED 1.00]
- **Student Sign-in Verification Flow** — tools_readme_term_signin_checkurl, tools_readme_web_app_deployment, tools_readme_google_apps_script_signin, tools_readme_class_roster_sheet [EXTRACTED 1.00]

## Communities (9 total, 2 thin omitted)

### Community 0 - "Soneva Concepts and Activities"
Cohesion: 0.12
Nodes (14): barsHTML(), Glass and Sun Escape family package, Lena's booking (selling process example), R renderer registry, R.builder renderer (plan card + stress tests), R.claims claim checker, R.classify renderer, R.grid 2x2 societal product grid (+6 more)

### Community 1 - "Routing and Sign-in Pages"
Cohesion: 0.18
Nodes (13): Google Apps Script class-list check (TERM.signin.checkUrl), CASES data object (sto, soneva), footHTML(), me() current student record, renderHome(), renderLanding(), renderPaper() practice paper view, renderVerify() student sign-in form (+5 more)

### Community 2 - "Practice Paper Engine"
Cohesion: 0.25
Nodes (14): BANK question bank (from bank.js), bindMarks(), bindTimer(), guideHTML(), modelHTML() model answer + rubric, newEssaySet(), newMCQSet() balanced random MCQ draw, renderEssays() Section B (+6 more)

### Community 3 - "STO Case and Channels"
Cohesion: 0.19
Nodes (9): R.atmos atmosphere designer, R.channel channel builder, State Trading Organisation (STO), STO Retail: Reaching Every Island (case), STO Exhibit 1: rice price build-up MVR 28 to 45, STO Exhibit 2: routes to customers, STO Online, STO People's Choice stores (+1 more)

### Community 4 - "Case Pages and Exam Data"
Cohesion: 0.18
Nodes (10): caseHTML(), EXAM data (Section C guides, model answers, rubrics), logo(), partKey/getPart/setPart activity state, renderAct() activity view, renderCase(), renderRead(), renderSecC() Section C case picker (+2 more)

### Community 5 - "Sign-in Setup Guide"
Cohesion: 0.22
Nodes (7): mkt101-cases Repository, MKT101 T2 2026 Class Roster (Google Sheet), Google Apps Script Sign-in Check (mkt101-signin-apps-script.gs), Student Sign-in Setup, TERM.signin.checkUrl (bank.js), testCheck, Apps Script Web App Deployment (/exec URL)

### Community 6 - "MNU Logo and Brand"
Cohesion: 1.00
Nodes (3): MNU Brand Identity (blue emblem: rising sun over open book, arched door with lock and key, Dhivehi and English wordmark), MNU Logo (The Maldives National University), The Maldives National University

## Knowledge Gaps
- **11 isolated node(s):** `Google Apps Script class-list check (TERM.signin.checkUrl)`, `renderTerms() flashcards`, `R.builder renderer (plan card + stress tests)`, `State Trading Organisation (STO)`, `STO People's Choice stores` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 22 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CASES data object (sto, soneva)` connect `Routing and Sign-in Pages` to `Soneva Concepts and Activities`, `STO Case and Channels`, `Case Pages and Exam Data`?**
  _High betweenness centrality (0.285) - this node is a cross-community bridge._
- **What connects `Google Apps Script class-list check (TERM.signin.checkUrl)`, `renderTerms() flashcards`, `R.builder renderer (plan card + stress tests)` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Soneva Concepts and Activities` be split into smaller, more focused modules?**
  _Cohesion score 0.12121212121212122 - nodes in this community are weakly interconnected._
- **Why does `renderCase()` connect `Case Pages and Exam Data` to `Routing and Sign-in Pages`, `Practice Paper Engine`?**
  _High betweenness centrality (0.247) - this node is a cross-community bridge._
- **Why does `STO Retail: Reaching Every Island (case)` connect `STO Case and Channels` to `Soneva Concepts and Activities`, `Routing and Sign-in Pages`?**
  _High betweenness centrality (0.183) - this node is a cross-community bridge._