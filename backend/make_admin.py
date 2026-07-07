import sys
from app import app
from models import db, User

def make_admin(email):
    with app.app_context():
        user = User.query.filter_by(email=email).first()
        if not user:
            print(f"Error: User with email '{email}' not found.")
            return
        
        if user.role == 'admin':
            print(f"User '{email}' is already an admin.")
            return

        user.role = 'admin'
        db.session.commit()
        print(f"Success: User '{email}' has been granted admin privileges!")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python make_admin.py <user_email>")
        sys.exit(1)
    
    email_arg = sys.argv[1]
    make_admin(email_arg)
