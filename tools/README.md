# Student sign-in

Students type their name and student ID. Only IDs on the MKT101 class list can get in. Names are not checked.

The class list is stored in `roster.js` as **scrambled IDs only** (SHA-256 hashes), with no names and no readable IDs. The page scrambles the typed ID the same way and checks it against the list. No server, Google account or login is involved.

## Update the class list (each term, or when students add or drop)

1. Download the class lists from the MNU system (for example `ClassList_MKT101_H012026T2.xls` and `ClassList_MKT101_H022026T2.xls`).
2. For a new term, change `TERM` at the top of `tools/build-roster.py` (for example `"T3 2026"`). Also update `TERM.term` in `bank.js` (the term shown on the site).
3. In the `mkt101-cases` folder, run:

   ```bash
   python3 tools/build-roster.py ~/Downloads/ClassList_MKT101_H012026T2.xls ~/Downloads/ClassList_MKT101_H022026T2.xls
   ```

   It reads every file you give it and leaves out students marked **Drop**. A student who moved section stays in. Your test ID `S000001` is always included. CSV files with IDs in the first column also work.
4. Commit and push `roster.js`.

**Never commit the class list files themselves.** The repo is public.

## Notes

- **If `roster.js` is empty or missing,** any correctly formatted ID (S0 + 5 digits) can sign in.
- **This is a light check, not real security.** Someone technical could work out which IDs are on the list, but never the names. That's fine for a practice site.
- **Google Apps Script (not in use).** `mkt101-signin-apps-script.gs` is kept for reference only; the arena checks IDs against `roster.js`.
- **Firebase rules.** `tools/build-rules.py` takes the same class list files (or a Moodle participants CSV) and writes `firestore.rules`. See the main README.
