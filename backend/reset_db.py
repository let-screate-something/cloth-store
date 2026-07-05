import os
from app import app
from models import db

def reset_database():
    with app.app_context():
        print("Dropping all tables...")
        db.drop_all()
        print("All tables dropped.")
        
        print("Creating new tables based on the new schema...")
        db.create_all()
        print("Successfully created all new tables!")

if __name__ == '__main__':
    reset_database()
