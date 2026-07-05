import os
from app import app
from models import db, Category, Product, ProductVariant, ProductImage

def seed_database():
    with app.app_context():
        print("Seeding database...")
        
        # 1. Create Categories
        mens = Category(name="Men's Clothing", slug="mens-clothing", description="Apparel for men")
        womens = Category(name="Women's Clothing", slug="womens-clothing", description="Apparel for women")
        db.session.add_all([mens, womens])
        db.session.commit()
        
        tshirts_m = Category(name="T-Shirts", slug="mens-tshirts", parent_id=mens.id)
        jackets_m = Category(name="Jackets", slug="mens-jackets", parent_id=mens.id)
        dresses_w = Category(name="Dresses", slug="womens-dresses", parent_id=womens.id)
        db.session.add_all([tshirts_m, jackets_m, dresses_w])
        db.session.commit()

        # 2. Create Products
        p1 = Product(category_id=tshirts_m.id, name="Classic White Tee", slug="classic-white-tee", description="A premium cotton white t-shirt.", base_price=25.00)
        p2 = Product(category_id=jackets_m.id, name="Leather Biker Jacket", slug="leather-biker-jacket", description="Genuine leather jacket.", base_price=150.00)
        p3 = Product(category_id=dresses_w.id, name="Summer Floral Dress", slug="summer-floral-dress", description="Lightweight floral dress.", base_price=45.00)
        db.session.add_all([p1, p2, p3])
        db.session.commit()

        # 3. Create Variants (Sizes/Colors)
        v1 = ProductVariant(product_id=p1.id, sku="TEE-WHT-S", size="S", color="White", stock_quantity=10)
        v2 = ProductVariant(product_id=p1.id, sku="TEE-WHT-M", size="M", color="White", stock_quantity=20)
        v3 = ProductVariant(product_id=p1.id, sku="TEE-WHT-L", size="L", color="White", stock_quantity=15)
        
        v4 = ProductVariant(product_id=p2.id, sku="JCK-BLK-M", size="M", color="Black", stock_quantity=5)
        v5 = ProductVariant(product_id=p2.id, sku="JCK-BLK-L", size="L", color="Black", price_override=160.00, stock_quantity=2) # L is more expensive
        
        v6 = ProductVariant(product_id=p3.id, sku="DRS-FLR-S", size="S", color="Floral", stock_quantity=8)
        db.session.add_all([v1, v2, v3, v4, v5, v6])
        db.session.commit()

        # 4. Create Images
        i1 = ProductImage(product_id=p1.id, image_url="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80", is_primary=True)
        i2 = ProductImage(product_id=p2.id, image_url="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80", is_primary=True)
        i3 = ProductImage(product_id=p3.id, image_url="https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80", is_primary=True)
        db.session.add_all([i1, i2, i3])
        db.session.commit()

        print("Database seeded successfully!")

if __name__ == '__main__':
    seed_database()
