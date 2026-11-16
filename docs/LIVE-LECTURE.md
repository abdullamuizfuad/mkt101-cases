# Live lectures

A live lecture runs from the Arena: the lecturer's projector shows the deck, and students answer on their phones in the Arena they
already use (same sign-in, XP, badges and progress). Code: `lecture/lecture.js` (runtime), `lecture/ch13.js` (Chapter 13 content),
`lecture/lecture.css`, `lecture/ch13/` (voice clips, QR code, feed images). It is course-level code: the shared `engine/` is untouched.

| Route | Who | What |
|---|---|---|
| `#/lecture/ch13` | students | The live page: activities open by themselves when the deck opens them |
| `#/lecture/ch13/deck` | lecturer | The projector deck (full screen, keyboard or clicker) |
| `#/lecture/ch13/notes` | lecturer | Presenter window: note line, pacing against the plan, next slide, Next/Back buttons |

The Lecturer tab has a **🎤 Live lecture** card: open the deck, the presenter view, end the lecture, or clear answers after a dry run.

## Before class
1. Publish the rules once: `python3 tools/build-rules.py <class list>` → Firebase console → Firestore → Rules → paste → Publish.
   The new `lec` block lets students write only their own answers, and only while the lecture is live.
2. Dry run on the projector laptop, signed in as `S000001`, with one phone signed in as a student. Then **Clear answers** on the card.
3. Students open `abdullamuizfuad.github.io/mkt101-cases/#/lecture/ch13` (QR on the first slide) and wait on "Get ready".

## During class (deck keys)
→ / Space / clicker: next · ←: back · F: full screen · T: light or dark · P: presenter window · N: notes strip · M: mute voices ·
A: replay the last voice · + / −: 30 seconds on a timer · 1 / 2: carry Client A or B · 1 2 3: the class choice when offline ·
6: short Term Snap (6 rounds) · E: end the lecture.

The first → on the title slide makes the lecture live for 3 hours. Nothing moves on by itself, except a Term Snap round, which closes
after 12 seconds. Without the cloud, every live slide shows a show-of-hands version.

## Data and XP
`lec/{id}` (lecturer only) and `lec/{id}/a/{SID}` (each student's answers, while live). In progress: `U.lec[id]` (additive).
XP keys start `lec:<id>:`. Term Snap answers count toward Topic 13 mastery and the MCQ counters. Badges: **Sales Force Representative**
(the badge slide) and **Top Closer** (top 3 in Term Snap).

## Content rules
Soneva Fushi facts only as stated in the Arena's Soneva case. The prospects, Maya, the calls, the search results and the feed are
teaching scenarios, labelled on the slides. None of it repeats the tutorial case. Plain English, no em-dashes (`lxcontent` test).

## Voices
The sales-call clips are made with Kokoro (open-licence, offline). After editing a line in `lecture/ch13.js`:
`node tools/lecture/lines.mjs ch13 > /tmp/lines.json` then `python3 tools/lecture/voices.py <model dir> /tmp/lines.json lecture/ch13/audio`
(see the script for setup). Only changed lines are remade. "Soneva Fushi" is spoken as So-NAY-vaa FOO-shee.

## Feed images
`lecture/ch13/feed/p1.svg` … `p9.svg` are placeholders. Replace them with the real images (same names, or change the list in
`lecture/ch13.js` → `clients.B.feed.pics`). Square, no real faces, names or logos.

## Tests
`node tools/tests/run.js --only=lxcontent|lxphone|lxdeck|lxoffline` and, in the cloud suite, `liveLecture` (rules, deck and phone in
step, 55 answers at once, badge, end).
