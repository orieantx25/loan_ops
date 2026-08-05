# -*- coding: utf-8 -*-
"""Quick validation of dashboard metrics after consistency fix."""
import json
from pathlib import Path

# Mirror key logic from analytics (minimal)
SRC = Path("web/src/data/students.json")
data = json.loads(SRC.read_text(encoding="utf-8"))

def yes(v):
    return str(v or "").strip().lower() == "yes"

def vendors_of(r):
    out = []
    if yes(r.get("sharedIcici")): out.append("ICICI")
    if yes(r.get("sharedPropelld")): out.append("Propelld")
    if yes(r.get("sharedStudy4Buddy")): out.append("Study4Buddy")
    if yes(r.get("sharedPoonawala")): out.append("Poonawala Fincorp")
    if yes(r.get("sharedGyandhan")): out.append("GyanDhan")
    return out

def norm_campus(c):
    t = str(c or "").strip()
    m = {"SSHAE": "SSAHE", "ssHAE": "SSAHE", "ssahe": "SSAHE"}
    label = m.get(t, t.upper() if t else "—")
    if not label or label == "—":
        return "Unassigned"
    return label

pipeline = [r for r in data if yes(r.get("loanRequired"))]
need_loan = len(pipeline)

campus_labels = sorted(set(norm_campus(r.get("campus")) for r in data),
                       key=lambda x: (x == "Unassigned", x))
campus_need = sum(
    sum(1 for r in data if norm_campus(r.get("campus")) == c and yes(r.get("loanRequired")))
    for c in campus_labels
)

vendors = ["ICICI", "Propelld", "Study4Buddy", "Poonawala Fincorp", "GyanDhan"]
print("Need Loan (global):", need_loan)
print("Campus Need Loan sum:", campus_need)
print("Match:", need_loan == campus_need)
print()
for v in vendors:
    shared = [r for r in data if v in vendors_of(r)]
    apps = len(shared)
    exclusive = sum(1 for r in shared if len(vendors_of(r)) == 1 and vendors_of(r)[0] == v)
    print(f"{v}: Applications={apps}, Unique only={exclusive}, Multi={apps-exclusive}")

total_apps = sum(len(vendors_of(r)) for r in data)
print("Total applications (sum vendor flags):", total_apps)
