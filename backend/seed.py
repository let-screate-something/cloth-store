import os
from app import app
from models import db, Product

def seed_db():
    with app.app_context():
        # Create all tables
        db.create_all()

        # Check if products already exist
        if Product.query.first() is None:
            products = [
                Product(name="Classic White T-Shirt", price=29.99, category="Tops", description="A high-quality, comfortable cotton t-shirt perfect for everyday wear."),
                Product(name="Denim Jacket", price=89.99, category="Outerwear", description="Stylish and durable denim jacket for a classic look."),
                Product(name="Black Chino Pants", price=59.99, category="Bottoms", description="Versatile black chinos that can be dressed up or down.")
            ]
            db.session.bulk_save_objects(products)
            db.session.commit()
            print("Database seeded with initial products.")
        else:
            print("Database already contains data.")

if __name__ == '__main__':
    seed_db()
