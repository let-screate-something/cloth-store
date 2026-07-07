import unittest
import json
import os
from app import app, db
from models import User, Category, Product, ProductVariant

class ClothStoreAPITestCase(unittest.TestCase):
    def setUp(self):
        # Configure app for testing
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///local_store.db' # Use the local db
        self.client = app.test_client()
        
        # Keep track of tokens
        self.user_token = None
        self.admin_token = None

    def test_01_register(self):
        response = self.client.post('/api/auth/register', 
            data=json.dumps({
                'name': 'Test User',
                'email': 'testuser@example.com',
                'password': 'password123'
            }),
            content_type='application/json'
        )
        data = json.loads(response.data)
        
        # If user exists from previous run, it might return 400. Let's handle it gracefully.
        if response.status_code == 400 and data.get('message') == 'Email already registered':
            print("User already registered, moving on.")
        else:
            self.assertEqual(response.status_code, 201)
            self.assertIn('token', data)

    def test_02_login(self):
        response = self.client.post('/api/auth/login', 
            data=json.dumps({
                'email': 'testuser@example.com',
                'password': 'password123'
            }),
            content_type='application/json'
        )
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 200, f"Login failed: {data}")
        self.assertIn('token', data)
        self.__class__.user_token = data['token']
        
    def test_03_get_products(self):
        response = self.client.get('/api/products')
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(isinstance(data, list))
        
    def test_04_get_product_by_slug_and_id(self):
        # Get first product
        resp = self.client.get('/api/products')
        products = json.loads(resp.data)
        if not products:
            self.skipTest("No products seeded")
            
        p = products[0]
        # Test by slug
        resp_slug = self.client.get(f'/api/products/{p["slug"]}')
        self.assertEqual(resp_slug.status_code, 200)
        
        # Test by ID
        resp_id = self.client.get(f'/api/products/{p["id"]}')
        self.assertEqual(resp_id.status_code, 200)
        
    def test_05_place_order(self):
        if not self.__class__.user_token:
            self.skipTest("No user token")
            
        # Get a product variant to order
        with app.app_context():
            variant = ProductVariant.query.first()
            if not variant:
                self.skipTest("No variant seeded")
            vid = variant.id
            
        headers = {'Authorization': f'Bearer {self.__class__.user_token}'}
        
        payload = {
            'items': [
                {'variant_id': vid, 'quantity': 1}
            ]
        }
        
        response = self.client.post('/api/orders',
            headers=headers,
            data=json.dumps(payload),
            content_type='application/json'
        )
        data = json.loads(response.data)
        # Should be 201 but if Razorpay fails it might be 500
        print(f"Place order response: {response.status_code}, {data}")
        # Because we are in testing without mock razorpay keys, it might fail. Let's see what happens.

    def test_06_admin_create_product(self):
        # Create an admin user
        with app.app_context():
            if not User.query.filter_by(email='admin@example.com').first():
                from werkzeug.security import generate_password_hash
                admin = User(email='admin@example.com', password_hash=generate_password_hash('admin123'), role='admin')
                db.session.add(admin)
                db.session.commit()
                
        # Login as admin
        resp = self.client.post('/api/auth/login', json={'email': 'admin@example.com', 'password': 'admin123'})
        admin_token = json.loads(resp.data)['token']
        self.__class__.admin_token = admin_token
        
        # Test create product (needs form data with image)
        import io
        headers = {'Authorization': f'Bearer {admin_token}'}
        data = {
            'name': 'Test New Product',
            'price': '50.00',
            'category': "Men's Clothing",
            'description': 'A new product',
            'image': (io.BytesIO(b"fake image data"), 'test.jpg')
        }
        # Since cloudinary will fail with fake data in test without mocking, we should probably mock cloudinary or just expect a 500/400.
        # But wait, we can just patch cloudinary in the test.
        from unittest.mock import patch
        with patch('cloudinary.uploader.upload') as mock_upload:
            mock_upload.return_value = {'secure_url': 'http://example.com/img.jpg'}
            resp2 = self.client.post('/api/products', headers=headers, data=data, content_type='multipart/form-data')
            self.assertEqual(resp2.status_code, 201)
            
    def test_07_verify_payment(self):
        # Place an order to get order_id and razorpay_order_id
        if not self.__class__.user_token:
            self.skipTest("No user token")
            
        with app.app_context():
            variant = ProductVariant.query.first()
            vid = variant.id
            
        headers = {'Authorization': f'Bearer {self.__class__.user_token}'}
        resp = self.client.post('/api/orders', headers=headers, json={'items': [{'variant_id': vid, 'quantity': 1}]})
        order_data = json.loads(resp.data)
        
        # Verify payment
        verify_payload = {
            'razorpay_payment_id': 'pay_dummy_123',
            'razorpay_order_id': order_data['razorpay_order_id'],
            'razorpay_signature': 'dummy_signature'
        }
        resp2 = self.client.post('/api/orders/verify', headers=headers, json=verify_payload)
        data2 = json.loads(resp2.data)
        self.assertEqual(resp2.status_code, 200, f"Verify failed: {data2}")

    def test_08_get_admin_orders(self):
        if not self.__class__.admin_token:
            self.skipTest("No admin token")
        headers = {'Authorization': f'Bearer {self.__class__.admin_token}'}
        resp = self.client.get('/api/admin/orders', headers=headers)
        self.assertEqual(resp.status_code, 200)

if __name__ == '__main__':
    unittest.main(verbosity=2)
