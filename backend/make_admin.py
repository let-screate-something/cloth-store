import os
from app import app
from models import db, User

def make_admin(email):
    with app.app_context():
        user = User.query.filter_by(email=email).first()
        if user:
            user.is_admin = True
            db.session.commit()
            print(f"Success! {email} is now an admin.")
        else:
            print(f"Error: Could not find user with email '{email}'.")

if __name__ == '__main__':
    import sys
    if len(sys.argv) < 2:
        print("Usage: python make_admin.py <email>")
    else:
        make_admin(sys.argv[1])
