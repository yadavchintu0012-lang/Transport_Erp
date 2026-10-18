import sys
import os
import psycopg2

def migrate(cloud_url: str):
    if not cloud_url:
        print("Error: Please provide cloud database URL.")
        sys.exit(1)

    print("Connecting to Cloud PostgreSQL...")
    if cloud_url.startswith("postgres://"):
        cloud_url = cloud_url.replace("postgres://", "postgresql://", 1)

    os.environ["DATABASE_URL"] = cloud_url
    sys.path.insert(0, os.path.abspath("backend"))

    from app.core.database import Base, engine
    from app.services.seed import seed
    from sqlalchemy import inspect

    print("Creating all 16 tables in cloud database...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")

    print("Seeding initial company, users, fleet, trips, and roles...")
    seed()
    print("Seed completed successfully!")

    inspector = inspect(engine)
    tables = sorted(inspector.get_table_names())
    print(f"Verified {len(tables)} tables in cloud database: {tables}")

    sql_file = os.path.join("database", "transportpro_all_data.sql")
    if os.path.exists(sql_file):
        print("Importing all data records from database/transportpro_all_data.sql...")
        with open(sql_file, "r", encoding="utf-8") as f:
            sql_script = f.read()
        conn = psycopg2.connect(cloud_url)
        conn.autocommit = True
        cur = conn.cursor()
        cur.execute(sql_script)
        cur.close()
        conn.close()
        print("All data records imported successfully!")

    print("\nSUCCESS! Your cloud database is 100% setup and ready for Render and all devices!")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        migrate(sys.argv[1])
    else:
        url = input("Enter your Cloud PostgreSQL 100_URL: ").strip()
        migrate(url)
