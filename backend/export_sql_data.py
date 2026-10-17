import psycopg2, json

conn = psycopg2.connect(dbname='transportpro', user='postgres', password='postgres', host='localhost', port=5432)
cur = conn.cursor()
tables = [
    'subscription_plans',
    'organizations',
    'roles',
    'users',
    'organization_memberships',
    'subscriptions',
    'drivers',
    'vehicles',
    'customers',
    'trips',
    'expenses',
    'invoices',
    'payments',
    'audit_logs',
    'notifications',
    'saas_admin_notes'
]

lines = [
    '--',
    '-- TransportPro ERP - Complete Database Data Records',
    '-- Ready to run directly in pgAdmin Query Tool or psql',
    '--',
    "SET statement_timeout = 0;",
    "SET client_encoding = 'UTF8';",
    ''
]

total = 0
for table in tables:
    cur.execute(f'SELECT * FROM {table};')
    rows = cur.fetchall()
    if not rows:
        continue
    cols = [d[0] for d in cur.description]
    cols_str = ', '.join(['"' + c + '"' for c in cols])
    lines.append(f'-- Table: {table} ({len(rows)} records)')
    for r in rows:
        vals = []
        for v in r:
            if v is None:
                vals.append('NULL')
            elif isinstance(v, bool):
                vals.append('TRUE' if v else 'FALSE')
            elif isinstance(v, (int, float)):
                vals.append(str(v))
            elif isinstance(v, (dict, list)):
                esc = json.dumps(v).replace("'", "''")
                vals.append(f"'{esc}'")
            else:
                esc = str(v).replace("'", "''")
                vals.append(f"'{esc}'")
        joined_vals = ', '.join(vals)
        lines.append(f'INSERT INTO public."{table}" ({cols_str}) VALUES ({joined_vals}) ON CONFLICT DO NOTHING;')
        total += 1
    lines.append('')

with open('database/transportpro_all_data.sql', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines) + '\n')

print(f'SUCCESS: Exported {total} records to database/transportpro_all_data.sql')
cur.close()
conn.close()
