import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

db_url = os.environ.get("DATABASE_URL")
if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

engine = create_engine(db_url)

with engine.connect() as connection:
    # Add image_url to product
    try:
        connection.execute(text("ALTER TABLE product ADD COLUMN image_url VARCHAR(500);"))
        print("Added image_url to product table.")
    except Exception as e:
        print(f"Error adding image_url: {e}")
        
    # Add is_admin to user
    try:
        connection.execute(text("ALTER TABLE \"user\" ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;"))
        print("Added is_admin to user table.")
    except Exception as e:
        print(f"Error adding is_admin: {e}")
        
    connection.commit()
    print("Done!")
