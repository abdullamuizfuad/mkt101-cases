# MKT101 Arena

A gamified practice portal for **MKT101 Introduction to Marketing** at MNU, Topics 8 to 14 (new products, pricing, channels, retailing, IMC, selling and sustainable marketing). Static site on GitHub Pages (`abdullamuizfuad.github.io/mkt101-cases`), installable as an app, with an optional Firebase layer for accounts, sync, a live leaderboard and marking.

## What students get

- **Section A · MCQ**: one question per screen, up to 30 a set, instant feedback with the reason, optional topic filter, "New set" avoids the last set's questions, "Retry my mistakes", a results screen with accuracy by topic.
- **Section B · Written answers**: 42 short answers (plan with chips, then plan only / write on paper, timed / type or speak it with an automatic concept check) and 28 long answers (guide, 18-minute timer, rubric self-mark, model answer).
- **Section C · Cases**: STO and Soneva Fushi, extended with new sections and exhibits. Read (sections marked read), Boardroom verdicts, hands-on activities, practice sets in focus mode with model answers, exhibits and key terms.
- **Study notes** for every topic, with "I've studied this topic".
- XP, nine levels (Intern → Marketing Consultant), streaks, three daily missions a day (tiered), 40 badges (levels, streaks, topic mastery, MCQ "prove it" badges, case badges and more), weak-spot practice, restart with exact XP refunds, a save/backup popup, a first-time tour, light and dark themes.

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
| `sw.js`, `manifest.webmanifest` | Install as an app, offline support (cache `mkt101-arena-v1`) |
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

With `CLOUD_ON=false` the site runs device-only: the Firebase SDK is never requested. The data model is the same as MKT301's: `users/{SID}` `{name,u,xp,ts}`, `board/{SID}` `{n,x,l,b,s,t}`, `reviews/{SID}` `{m}`.

## Tests

```bash
node tools/tests/run.js                                        # site (Playwright)
RULES=path/to/firestore.rules node tools/tests/firebase-run.js # cloud, against the Firebase emulators
```

Both use made-up test IDs, never real students.
