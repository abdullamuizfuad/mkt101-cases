# Student sign-in setup

Students sign in with their name and student ID. The site sends only the ID to a Google Apps Script, which checks the class list in a Google Sheet and answers yes or no. The list never reaches the browser, so this public repo holds no student data.

## One-time setup

1. **Class list.** Fill in the Excel template `MKT101 T2 2026 Class Roster.xlsx` (kept outside this repo, in the MKT101 folder). Column A holds IDs such as `S012345`. Column B holds names (optional). Keep the `S000001` lecturer row.
2. **Google Sheet.** Sign in with the **Islandeative Workspace account**, not MNU. MNU's Google settings block outside visitors. Upload the Excel file to Drive, open it with Google Sheets, then choose **File > Save as Google Sheets**.
3. **Script.** In the Google Sheet, open **Extensions > Apps Script**. Replace the code with `mkt101-signin-apps-script.gs` and save. Optionally run `testCheck` and read the log.
4. **Deploy.** Choose **Deploy > New deployment > Web app**. Set **Execute as: Me** and **Who has access: Anyone**. Authorise, then copy the link that ends in `/exec`.
5. **Test.** In an Incognito window, open the link with `?action=check&sid=S000001` added to the end. You should see `{"ok":true,...}`.
6. **Connect the site.** In `bank.js`, set `TERM.signin.checkUrl` to the `/exec` link, then publish the site.

Until step 6 is done, the site runs in **setup mode**. Anyone with a correctly formatted ID (S0 + 5 digits) can sign in.

## Later

- **Change the script:** Deploy > Manage deployments > pencil > Version: **New version** > Deploy. Do not make a new deployment, because that changes the link.
- **New term:** add a tab such as "Roster T3 2026" and rename the old one to "Archive T2 2026". Only tabs with "Roster" in the name are checked.
- **Google unreachable:** students still get in, marked unverified, so practice is never blocked. This is a practice site, so nothing is graded.
- **Limit:** this stops made-up IDs, but not a student using a classmate's real ID.
