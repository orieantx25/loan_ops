# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('audit_sheets_out.txt', encoding='utf-8') as f:
    lines = f.readlines()

out = open('audit_key.txt', 'w', encoding='utf-8')

# Focus sheets
focus = {
    'Data ', 'Data Summary', 'Dropdowns', 'Pivot Table 2',
    'Need FLDG attention', 'Student deferring loan requirem',
    'Need Vidyalakshmi Attention', 'Specific need students',
    'Students who want loan from nex', 'SSHAE', 'Sheet18'
}
# Limited rows for filtered views
limited = {
    'SummaryView': 3,
    'ADYPU ': 2,
    'Phase 2': 3,
    'Sheet13': 3,
    'Refund Mapping': 2,
    'Merit data': 2,
}
current = None
row_count = 0

for line in lines:
    if line.startswith('========== ['):
        current = line.split('[')[1].split(']')[0]
        row_count = 0
        out.write(line)
        continue
    if line.startswith('========== DEFINED') or line.startswith('========== FORMULA'):
        current = 'META'
        out.write('\n' + line)
        continue
    if current == 'META':
        out.write(line)
        continue
    if current in focus:
        # truncate line length
        out.write(line[:300] + ('...\n' if len(line) > 300 else ''))
    elif current in limited:
        if line.startswith('R'):
            row_count += 1
            if row_count <= limited[current]:
                out.write(line[:250] + ('...\n' if len(line) > 250 else ''))
    elif current is None:
        out.write(line)

out.close()
print('Wrote audit_key.txt')
