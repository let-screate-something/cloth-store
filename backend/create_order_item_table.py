import os
from app import app
from models import db

def create_new_tables():
    with app.app_context():
        # This will create any missing tables (like OrderItem)
        db.create_all()
        print("Successfully created missing tables.")

if __name__ == '__main__':
    create_new_tables()
