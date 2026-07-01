import os
from sqlalchemy import text
from app import app
from models import db

def add_razorpay_columns():
    with app.app_context():
        try:
            # Add razorpay_order_id
            db.session.execute(text('ALTER TABLE "order" ADD COLUMN razorpay_order_id VARCHAR(100)'))
            print("Added razorpay_order_id column successfully.")
        except Exception as e:
            print(f"Error adding razorpay_order_id: {e}")
            db.session.rollback()

        try:
            # Add razorpay_payment_id
            db.session.execute(text('ALTER TABLE "order" ADD COLUMN razorpay_payment_id VARCHAR(100)'))
            print("Added razorpay_payment_id column successfully.")
        except Exception as e:
            print(f"Error adding razorpay_payment_id: {e}")
            db.session.rollback()

        db.session.commit()
        print("Database alterations completed.")

if __name__ == '__main__':
    add_razorpay_columns()
