#!/usr/bin/env python3
"""Read the lecturer's class marks workbook and write a PRIVATE JSON file for tools/marks/upload.mjs.

    python3 tools/build-marks.py <class marks .xlsx> -o <private marks .json, outside the repo>
    node tools/marks/upload.mjs <private marks .json> --dry      (check)
    node tools/marks/upload.mjs <private marks .json>            (publish to each student)

Sheet "Class Marks", header row 9, students from row 10: B name, C group, D midterm /60, E midterm (20%), F report (20%),
G presentation (10%), H total so far /50, I min final mark to pass (/100), K final mark for HD (/100) or "Not reachable",
L midterm status, M student ID (000-089-639 → S089639), O note. Computed values are read, not formulas.

Privacy: nothing from the workbook goes into the repo. Each student's record is written to their own reviews/{SID}
document (key cm_<term>), which only that student and the lecturer can read (existing rules). The JSON file holds names
and marks: keep it outside the repo and delete it when done. Never commit the workbook.
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

def num(v): return round(float(v), 2) if isinstance(v, (int, float)) else None

def main(argv):
    try: import openpyxl
    except ImportError: sys.exit("Needs: pip install openpyxl")
    if "-o" not in argv: sys.exit(__doc__)
    i = argv.index("-o"); out = Path(argv[i + 1]); argv = argv[:i] + argv[i + 2:]
    if ROOT in out.resolve().parents: sys.exit("✗ Write the JSON outside the repo (it holds names and marks).")
    ws = openpyxl.load_workbook(argv[0], data_only=True)["Class Marks"]
    recs, skipped = {}, []
    for r in range(10, ws.max_row + 1):
        v = [ws.cell(r, c).value for c in range(1, 16)]
        name, rid = v[1], str(v[12] or "").strip()
        if not name and not rid: continue
        m = re.fullmatch(r"000-(\d{3})-(\d{3})", rid)
        if not m: skipped.append((r, rid)); continue
        note, hd = str(v[14] or ""), v[10]
        recs["S" + m.group(1) + m.group(2)] = {"n": str(name or "").strip(), "g": v[2], "mt": num(v[3]), "mtw": num(v[4]), "rp": num(v[5]),
            "pr": num(v[6]), "tot": num(v[7]), "pass": num(v[8]), "hd": num(hd) if isinstance(hd, (int, float)) else "NR",
            "st": str(v[11] or ""), "nog": 1 if re.search(r"not in any assignment group", note, re.I) else 0}
    out.write_text(json.dumps({"term": "T2 2026", "key": "cm_t2_2026", "recs": recs}, indent=1), encoding="utf-8")
    out.chmod(0o600)
    print(f"✓ {out}: {len(recs)} students (private: names and marks)")
    for r, rid in skipped: print(f"⚠ row {r}: student ID {rid!r} is not in the 000-089-639 format, skipped")

if __name__ == "__main__":
    main(sys.argv[1:])
