import os
from app import app
from models import db
from sqlalchemy import text

def run_migration():
    with app.app_context():
        # Create OTPRecord table
        db.create_all()
        print("Created missing tables (OTPRecord).")
        
        # Alter User table
        try:
            # Check if phone column exists
            with db.engine.connect() as conn:
                try:
                    conn.execute(text("ALTER TABLE \"user\" ADD COLUMN phone VARCHAR(20) UNIQUE;"))
                    print("Added 'phone' column to User table.")
                except Exception as e:
                    print(f"Column 'phone' might already exist or error: {e}")
                    
                try:
                    conn.execute(text("ALTER TABLE \"user\" ALTER COLUMN email DROP NOT NULL;"))
                    print("Made 'email' nullable.")
                except Exception as e:
                    print(f"Error altering email: {e}")
                    
                try:
                    conn.execute(text("ALTER TABLE \"user\" ALTER COLUMN name DROP NOT NULL;"))
                    print("Made 'name' nullable.")
                except Exception as e:
                    print(f"Error altering name: {e}")
                    
                try:
                    conn.execute(text("ALTER TABLE \"user\" ALTER COLUMN password_hash DROP NOT NULL;"))
                    print("Made 'password_hash' nullable.")
                except Exception as e:
                    print(f"Error altering password_hash: {e}")
                    
                conn.commit()
                print("Migration completed successfully.")
        except Exception as e:
            print(f"Migration failed: {e}")

if __name__ == '__main__':
    run_migration()
