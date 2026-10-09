import sqlite3
conn = sqlite3.connect("transportpro.db")
c = conn.cursor()
c.execute("UPDATE trips SET amount_paid = 39900, due_amount = 0 WHERE trip_number = 'TRP-2026-0001'")
c.execute("UPDATE trips SET amount_paid = 25000, due_amount = 40100 WHERE trip_number = 'TRP-2026-0002'")
c.execute("UPDATE trips SET amount_paid = 0, due_amount = 56700 WHERE trip_number = 'TRP-2026-0003'")
conn.commit()
conn.close()
print("Updated existing trips with amount_paid and due_amount!")