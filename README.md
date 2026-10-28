# MKT101 Arena

A gamified practice portal for **MKT101 Introduction to Marketing** at MNU, Topics 8 to 14 (new products, pricing, channels, retailing, IMC, selling and sustainable marketing). Static site on GitHub Pages (`abdullamuizfuad.github.io/mkt101-cases`), installable as an app, with an optional Firebase layer for accounts, sync, a live leaderboard and marking.

## What students get

- **Section A · MCQ**: one question per screen, up to 30 a set, instant feedback with the reason, optional topic filter, "New set" avoids the last set's questions, "Retry my mistakes", a results screen with accuracy by topic.
- **Section B · Written answers**: 42 short answers (plan with chips, then plan only / write on paper, timed / type or speak it with an automatic concept check) and 28 long answers (guide, 18-minute timer, rubric self-mark, model answer).
- **Section C · Cases**: STO and Soneva Fushi, extended with new sections and exhibits. Read (sections marked read), Boardroom verdicts, hands-on activities, practice sets in focus mode with model answers, exhibits and key terms.
- **Study notes** for every topic, with "I've studied this topic".
- XP, nine levels (Intern → Marketing Consultant), streaks, three daily missions a day (tiered), 40 badges (levels, streaks, topic mastery, MCQ "prove it" badges, case badges and more), weak-spot practice, restart with exact XP refunds, a save/backup popup, a first-time tour, light and dark themes.
- **⏱️ Screen time** on Home: today, this week, total, a 7-day chart and the 20-minute daily goal. It counts only while the portal is on screen and the student is active (it pauses after 2 minutes without a tap, key or scroll, except while a writing timer runs or 🎤 dictation is on). XP: +15 once a day for 20 minutes; +10 for every 20 minutes outside live sessions, up to 6 a day; "Hours logged" badges at 5, 10 and 20 hours; a daily-goal mission in every tier.
- **Break reminder** after 20 minutes of continuous focus (a break = 3+ minutes without activity): *Start 5-min break* (screen time pauses) or *Not now* (asks again 10 minutes later). Never during a live session; held back while a writing timer runs or an MCQ question is open, and shown at the next pause.


MCQ sets can mix any topics: students tick one or more of Topics 8–14 (or All topics); the choice is remembered, and the set header, results and history name the topics.
## Live tutorial sessions (lecturer)

On the Lecturer tab, pick the week (**Week 11 to Week 14 tutorial**; the earliest week without a past session is preselected; the list is `SESS_WEEKS` in `presence.js`) and tap **▶ Start session**; it ends with **■ End session** or automatically after 3 hours. Students see a red banner and tap **Join**, after a note that explains exactly what is shared: whether the portal is on screen and which section they're on, nothing else, and only until the session ends. While joined, the portal reports 🟢 on screen / 🟡 idle (2+ minutes untouched) / 🔴 left the app (switched app or tab, locked screen), plus the current section; the lecturer's **live board** (`#/live`) adds ⚫ offline (no check-in for 5+ minutes), on-screen %, times left, longest time away and a "not joined" list, sortable. Ending saves a **report** (attendance, on-screen %, switches, what was practised) under **Past sessions** and in each student's profile, with a CSV download. Students on screen 85%+ of at least 10 joined minutes get **+20 XP**, claimed by their own portal.

Writes: only on a status change, a section change (at most every 30 s) and a heartbeat every 2 minutes: about 60–80 per student per 2-hour session, roughly 4,500 for 56 students (the free plan allows 20,000 a day). Data: `sessions/{id}` `{name,startedAt,endsAt,active,endedAt,rep}` (lecturer only) and `sessions/{id}/p/{SID}` `{st,sec,pr,on,idle,away,left,longest,ch,joinedAt,t}` (that student only, only while the session is open). Until the rules with these blocks are published, the session features stay hidden and everything else works.


If the live-session rules aren't published in the Firebase project yet, the card says so and explains how to publish them (Firestore → Rules → select all → paste the full rules file from `tools/build-rules.py` → Publish); it shows "Checking…" until Firestore answers, and screen time keeps working.

## Question coverage (lecturer)

A **Question coverage** card on the Lecturer tab (cloud) lists every question in the banks, grouped by topic (MCQs, short answers, long answers) and case, with how many students attempted each one and how often, the % correct for MCQs, and for written questions how many planned, wrote, typed and were marked, plus the average automatic band. Unattempted questions are highlighted, each group shows "Not attempted: N of M", and there are filters (section, only not attempted, least attempted first, search) and a CSV. It reads what progress already records (MCQs once per question per day answered fresh; written work from plan/timed/typed/check keys and typed answers); restarted questions drop out. Code: `coverage.js` (identical in MKT101 and MKT301).

## Student profiles (lecturer)

Signed in as `S000001` with the cloud on, tap any student on the **Leaderboard** or in the **Class dashboard** table (there is a search box above it) to open their full profile at `#/student/<ID>`. It updates live and shows: level, XP and streak; badges with dates; an 8-week practice calendar and recent activity; MCQ record; progress, mastery and weak spots by topic (decoys picked, key ideas missed); case progress; integrity flags; and every typed answer with its automatic check and mark. From the profile you can mark or re-mark an answer, **send a message** (it appears on the student's Home page; no XP), send a **PIN reset email**, or download the student's data as JSON.

Messages are stored in `reviews/{SID}.m` under keys starting `note_`. The site and the marking tools never treat them as marks.

## Files

| File | What it holds |
|---|---|
| `index.html` | Page shell and all styles |
| `app.js` | The engine: sign-in, XP, missions, badges, MCQ, written answers, cases, notes, lecturer tools, cloud sync |
| `bank.js`, `bank-x.js` | MCQs (30 per topic) and long answers |
| `bank-s.js` | Short-answer questions with plan chips |
| `notes.js` | Study notes for Topics 8–14 |
| `cases-data.js` | The original case text, activities and model answers |
| `case-extend.js` | Arena additions per case: new sections and exhibits, people, Boardroom, practice questions, review notes |
| `args.js`, `acts.js` | Case activity data and renderers |
| `concepts.js` | Automatic concept check for typed answers |
| `roster.js` | Class list as scrambled IDs (`tools/build-roster.py`) |
| `cloud-config.js` | **The one place for the Firebase config and the on/off switch** |
| `cloud.js`, `vendor/firebase.js` | Cloud layer (only loaded when the switch is on) |
| `presence.js` | Screen time, break reminders and live tutorial sessions (the same file as MKT301's) |
| `sw.js`, `manifest.webmanifest` | Install as an app, offline support (cache `mkt101-arena-v3`) |
| `tools/` | Class list, rules, marking and test tools |

Progress lives in `localStorage` under keys starting `mkt101_` (progress from the old practice site is carried over automatically).

## Turning on the cloud (accounts, sync, live leaderboard, marking)

1. The web config is already in `cloud-config.js`. To use a different Firebase project, paste its config there (nothing else needs changing).
2. Build the security rules from the class list and publish them:
   ```bash
   python3 tools/build-rules.py ClassList_MKT101_*.xls      # or a CSV of IDs, or a Moodle participants CSV
   ```
   Then Firebase console → Firestore → Rules → paste `firestore.rules` → Publish. The file contains student emails: never commit it (it is git-ignored).
3. In Firebase Authentication, enable Email/Password.
4. Set `CLOUD_ON=true` in `cloud-config.js` and push.

With `CLOUD_ON=false` the site runs device-only: the Firebase SDK is never requested. The data model is the same as MKT301's: `users/{SID}` `{name,u,xp,ts}`, `board/{SID}` `{n,x,l,b,s,t}`, `reviews/{SID}` `{m}`, plus `sessions/{id}` and `sessions/{id}/p/{SID}` for live sessions.

## Tests

```bash
node tools/tests/run.js                                        # site (Playwright)
RULES=path/to/firestore.rules node tools/tests/firebase-run.js # cloud, against the Firebase emulators
```

Both use made-up test IDs, never real students.
