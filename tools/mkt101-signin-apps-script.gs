/**
 * MKT101 Exam Practice: class list check
 * ------------------------------------------------------------------
 * Paste this into the Google Sheet that holds the class list
 * (Extensions > Apps Script), then deploy it as a web app.
 * Full steps: tools/README.md
 *
 * The website sends ONLY a student ID. This script answers yes or no.
 * It never sends the class list to the browser.
 *
 * Class list: every tab whose name contains "Roster".
 *   Column A: student ID (S0 + 5 digits). Header rows are ignored.
 *   Column B: student name as it should appear (optional).
 *   Column C: an email that replaces the student address (optional).
 */

const ADMIN_IDS = ["S000001"];   // lecturer test ID: always allowed

// Only needed if this script was NOT opened from the sheet (Extensions > Apps Script).
// Paste the long ID from the sheet's address: docs.google.com/spreadsheets/d/<THIS PART>/edit
const SHEET_ID = "";

function doGet(e) {
  try {
    return check_(e);
  } catch (err) {
    // Send the real error back as JSON, so problems show up in a browser test
    return out_({ ok: false, reason: "error", message: String(err && err.message || err) });
  }
}

function check_(e) {
  const p = (e && e.parameter) || {};
  if (p.action !== "check") return out_({ ok: false });
  const sid = String(p.sid || "").trim().toUpperCase();
  if (!/^S0\d{5}$/.test(sid)) return out_({ ok: false, reason: "format" });
  if (ADMIN_IDS.indexOf(sid) >= 0) {
    const a = lookup_(sid);
    return out_({ ok: true, name: (a.found && a.name) || "Lecturer access", email: (a.found && a.email) || "" });
  }
  const r = lookup_(sid);
  if (r.empty) return out_({ ok: true, open: true });          // no IDs yet: let anyone with a valid ID in
  if (r.found) return out_({ ok: true, name: r.name, email: r.email });
  return out_({ ok: false, reason: "not-listed" });
}

function lookup_(sid) {
  let rows = [];
  rosters_().forEach(function (sh) {
    rows = rows.concat(sh.getDataRange().getValues().filter(function (r) {
      return /^S0\d{5}$/i.test(String(r[0] || "").trim());
    }));
  });
  if (!rows.length) return { empty: true };
  for (const r of rows) {
    if (String(r[0]).trim().toUpperCase() === sid) {
      return { found: true, name: String(r[1] || "").trim(), email: String(r[2] || "").trim() };
    }
  }
  return { found: false };
}

function rosters_() {
  return book_().getSheets().filter(function (s) { return /roster/i.test(s.getName()); });
}

function book_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) return ss;
  if (!SHEET_ID) throw new Error("Script is not attached to a sheet. Set SHEET_ID at the top of the script.");
  return SpreadsheetApp.openById(SHEET_ID);
}

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/** Run once from the editor (select "setup", then Run) if the sheet has no Roster tab yet. */
function setup() {
  const ss = book_();
  if (rosters_().length) return;
  const sh = ss.insertSheet("Roster T2 2026");
  sh.getRange(1, 1, 2, 3).setValues([
    ["Student ID", "Name", "Email override (optional)"],
    ["S000001", "Abdulla Muiz Fuad", "abdulla.muiz@mnu.edu.mv"]
  ]);
  sh.getRange(1, 1, 1, 3).setFontWeight("bold");
  sh.setFrozenRows(1);
}

/** Run from the editor to test without deploying. Check the log (View > Logs). */
function testCheck() {
  Logger.log(doGet({ parameter: { action: "check", sid: "S000001" } }).getContent());
  Logger.log(doGet({ parameter: { action: "check", sid: "S099999" } }).getContent());
}
