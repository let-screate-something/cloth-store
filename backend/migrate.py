import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

db_url = os.environ.get('DATABASE_URL')
if not db_url:
    print("Error: DATABASE_URL not found.")
    exit(1)

engine = create_engine(db_url)

with engine.connect() as conn:
    try:
        conn.execute(text('ALTER TABLE products ADD COLUMN discount_percent INTEGER DEFAULT 0;'))
        print("Added discount_percent to products.")
    except Exception as e:
        print(f"Skipping discount_percent: {e}")
        
    try:
        conn.execute(text('ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);'))
        print("Added password_hash to users.")
    except Exception as e:
        print(f"Skipping password_hash: {e}")

    try:
        conn.execute(text('DROP TABLE IF EXISTS "user" CASCADE;'))
        print("Dropped old 'user' table if it existed.")
    except Exception as e:
        print(f"Skipping DROP TABLE user: {e}")

    conn.commit()

print("Migration completed.")
