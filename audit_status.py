# -*- coding: utf-8 -*-
"""Parse Loan Status multi-vendor and compute true unique vs occurrence counts."""
import sys
sys.stdout.reconfigure(encoding='utf-8')
import openpyxl
from collections import Counter, defaultdict
import re

wb = openpyxl.load_workbook(r'Master sheet - Loans .xlsx', data_only=True, read_only=True)
ws = wb['Master data']

headers = None
rows = []
for i, row in enumerate(ws.iter_rows(values_only=True)):
    if i == 0:
        headers = list(row)
        continue
    if row[1] is None:
        continue
    rows.append(row)

idx = {h: i for i, h in enumerate(headers) if h}

def get(r, col):
    i = idx.get(col)
    if i is None:
        return None
    return r[i] if i < len(r) else None

# Parse Loan Status into atomic tokens
status_tokens = Counter()
students_with_multi_status = 0
token_students = defaultdict(set)  # token -> set of student keys

for r in rows:
    status = get(r, 'Loan Status')
    mobile = get(r, 'Mobile Number')
    pid = get(r, 'Provisional ID')
    key = str(mobile).strip() if mobile else (str(pid).strip() if pid else None)
    if not status:
        continue
    parts = [p.strip() for p in str(status).split(',') if p.strip()]
    if len(parts) > 1:
        students_with_multi_status += 1
    for p in parts:
        status_tokens[p] += 1
        if key:
            token_students[p].add(key)

print('=== LOAN STATUS TOKEN OCCURRENCES (how Pivot counts) ===')
print(f'Students with multi-part Loan Status: {students_with_multi_status}')
print(f'Sum of status occurrences: {sum(status_tokens.values())}')
print(f'Students with any Loan Status: {sum(1 for r in rows if get(r, "Loan Status"))}')
print()
for t, c in status_tokens.most_common():
    unique = len(token_students[t])
    print(f'  occ={c:3d} unique_students={unique:3d} | {t}')

# Vendor share Yes flags
print('\n=== SHARED TO VENDOR (Yes flags) ===')
vendors = [
    ('ICICI', 'Shared to ICICI'),
    ('Propelld', 'Shared to Propelld '),
    ('Study4Buddy', 'Shared to Study4Buddy'),
    ('Poonawala', 'Shared to Poonawala Fincorp'),
    ('GyanDhan', 'Shared to GyanDhan'),
]
yes_vals = {'yes', 'y', 'true', '1'}
for label, col in vendors:
    count = 0
    for r in rows:
        v = get(r, col)
        if v is not None and str(v).strip().lower() in yes_vals:
            count += 1
    print(f'  {label}: {count}')

# Loan Stage / Loan Required crosstab for students needing loan
print('\n=== LOAN REQUIRED=Yes BY STAGE ===')
stage_c = Counter()
for r in rows:
    lr = get(r, 'Loan required\n(Latest)')
    stage = get(r, 'Loan Stage ')
    if lr is not None and str(lr).strip().lower() == 'yes':
        stage_c[str(stage).strip() if stage else '(blank)'] += 1
for s, c in stage_c.most_common():
    print(f'  {s}: {c}')

print('\n=== CAMPUS NORMALIZATION NEEDED ===')
camp = Counter()
for r in rows:
    c = get(r, 'Campus')
    if c:
        camp[str(c).strip()] += 1
for k, v in camp.most_common():
    print(f'  {repr(k)}: {v}')

print('\n=== CRITICALITY for Loan Required=Yes ===')
crit = Counter()
for r in rows:
    lr = get(r, 'Loan required\n(Latest)')
    if lr is not None and str(lr).strip().lower() == 'yes':
        g = get(r, 'Criticality \n(SST INput)')
        crit[str(g).strip() if g else '(blank)'] += 1
for k, v in crit.most_common():
    print(f'  {k}: {v}')

# Check email availability
print('\n=== EMAIL COLUMN? ===')
for h in headers:
    if h and 'mail' in str(h).lower():
        print(f'Found: {h}')
print('No email in Master data' if not any(h and "mail" in str(h).lower() for h in headers if h) else '')

# Check if Course column exists
print('\n=== COURSE COLUMN? ===')
for h in headers:
    if h and 'course' in str(h).lower():
        print(f'Found: {h}')
print('No Course in Master data' if not any(h and "course" in str(h).lower() for h in headers if h) else '')

wb.close()
