import os
import jwt
from functools import wraps
import cloudinary
import cloudinary.uploader
import razorpay
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from models import db, User, Category, Product, ProductVariant, ProductImage, Review, Order, OrderItem, Address
from datetime import datetime
import json

# Try importing firebase_admin, but don't crash if it's not installed yet
try:
    import firebase_admin
    from firebase_admin import credentials, auth as firebase_auth
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'super-secret-key-for-dev')

# Allowed frontend origin from env (defaults to localhost for local dev)
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
CORS(app, origins=[FRONTEND_URL], supports_credentials=True)

# Cloudinary Configuration
cloudinary.config(
  cloud_name = os.environ.get("CLOUDINARY_CLOUD_NAME"),
  api_key = os.environ.get("CLOUDINARY_API_KEY"),
  api_secret = os.environ.get("CLOUDINARY_API_SECRET")
)

# Razorpay Configuration
razorpay_client = razorpay.Client(
    auth=(os.environ.get("RAZORPAY_KEY_ID", ""), os.environ.get("RAZORPAY_KEY_SECRET", ""))
)

# Database Configuration
db_url = os.environ.get("DATABASE_URL")
if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = db_url or 'sqlite:///local_store.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Initialize Firebase Admin
if FIREBASE_AVAILABLE:
    try:
        # Check if service account file exists
        if os.path.exists("firebase-adminsdk.json"):
            cred = credentials.Certificate("firebase-adminsdk.json")
            firebase_admin.initialize_app(cred)
            print("Firebase Admin initialized successfully.")
        else:
            print("WARNING: firebase-adminsdk.json not found. Firebase Auth will not work.")
    except ValueError:
        # Already initialized
        pass

# --- Authentication Middleware ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
            
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
        except Exception as e:
            return jsonify({'message': 'Token is invalid!'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(" ")[1]
            
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
            
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
            if not current_user or current_user.role != 'admin':
                return jsonify({'message': 'Admin privileges required!'}), 403
        except Exception as e:
            return jsonify({'message': 'Token is invalid!'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

# --- Routes ---

@app.route('/api/auth/firebase-login', methods=['POST'])
def firebase_login():
    data = request.get_json()
    id_token = data.get('idToken')
    
    if not id_token:
        return jsonify({'message': 'Missing Firebase ID Token'}), 400
        
    try:
        if not FIREBASE_AVAILABLE or not os.path.exists("firebase-adminsdk.json"):
            # MOCK LOGIN FOR DEVELOPMENT IF FIREBASE ISN'T SETUP
            print("WARNING: Using mock Firebase login because Admin SDK is not configured.")
            phone = "+1234567890" # Mock phone
            firebase_uid = "mock-uid-123"
        else:
            # Verify the ID token first.
            decoded_token = firebase_auth.verify_id_token(id_token)
            firebase_uid = decoded_token['uid']
            phone = decoded_token.get('phone_number')
            
            if not phone:
                return jsonify({'message': 'No phone number found in Firebase token'}), 400
                
        # Find user by firebase_uid or phone
        user = User.query.filter((User.firebase_uid == firebase_uid) | (User.phone == phone)).first()
        
        if not user:
            # Create new user
            user = User(firebase_uid=firebase_uid, phone=phone)
            db.session.add(user)
            db.session.commit()
        elif not user.firebase_uid:
            # Link existing phone user to firebase
            user.firebase_uid = firebase_uid
            db.session.commit()
            
        # Issue our own JWT
        token = jwt.encode({'user_id': user.id, 'role': user.role}, app.config['SECRET_KEY'], algorithm="HS256")
        
        return jsonify({
            'token': token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        print(f"Firebase Login Error: {str(e)}")
        return jsonify({'message': 'Invalid Firebase Token or Server Error', 'error': str(e)}), 401


@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_me(current_user):
    return jsonify(current_user.to_dict()), 200

@app.route('/api/products', methods=['GET'])
def get_products():
    products = Product.query.filter_by(is_active=True).all()
    return jsonify([p.to_dict() for p in products]), 200

@app.route('/api/products/<string:slug>', methods=['GET'])
def get_product(slug):
    product = Product.query.filter_by(slug=slug, is_active=True).first()
    if product:
        return jsonify(product.to_dict()), 200
    return jsonify({"error": "Product not found"}), 404

@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify([c.to_dict() for c in categories]), 200

@app.route('/api/orders', methods=['POST'])
@token_required
def place_order(current_user):
    data = request.get_json()
    items = data.get('items', [])
    shipping_address_id = data.get('shipping_address_id')
    
    if not items:
        return jsonify({'message': 'Cart is empty'}), 400
        
    # Calculate total based on actual DB variant prices to prevent tampering
    subtotal = 0.0
    order_items_to_create = []
    
    for item in items:
        variant = ProductVariant.query.get(item['variant_id'])
        if not variant:
            return jsonify({'message': f"Variant {item['variant_id']} not found"}), 400
            
        if variant.stock_quantity < item['quantity']:
            return jsonify({'message': f"Not enough stock for {variant.product.name}"}), 400
            
        unit_price = variant.price_override if variant.price_override is not None else variant.product.base_price
        subtotal += unit_price * item['quantity']
        
        order_items_to_create.append(OrderItem(
            product_variant_id=variant.id,
            quantity=item['quantity'],
            unit_price=unit_price
        ))
        
        # Decrement stock
        variant.stock_quantity -= item['quantity']
        
    shipping_fee = 0.0 if subtotal > 100 else 9.99
    tax = subtotal * 0.08 # Example 8% tax
    total = subtotal + shipping_fee + tax
    
    new_order = Order(
        user_id=current_user.id,
        shipping_address_id=shipping_address_id,
        subtotal=subtotal,
        tax=tax,
        shipping_fee=shipping_fee,
        total_amount=total,
        status="pending"
    )
    db.session.add(new_order)
    db.session.flush() # Get order id
    
    for oi in order_items_to_create:
        oi.order_id = new_order.id
        db.session.add(oi)
        
    db.session.commit()
    
    try:
        is_dummy = os.environ.get("RAZORPAY_KEY_ID") == "rzp_test_dummy"
        amount_in_paise = int(total * 100)
        
        if is_dummy:
            razorpay_order_id = f"order_dummy_{new_order.id}"
        else:
            razorpay_order = razorpay_client.order.create(dict(
                amount=amount_in_paise,
                currency='INR',
                receipt=str(new_order.id),
                payment_capture='0'
            ))
            razorpay_order_id = razorpay_order['id']
        
        new_order.razorpay_order_id = razorpay_order_id
        db.session.commit()
        
        return jsonify({
            'message': 'Order placed successfully',
            'order_id': new_order.id,
            'razorpay_order_id': razorpay_order_id,
            'amount': amount_in_paise,
            'currency': 'INR'
        }), 201
    except Exception as e:
        return jsonify({'message': 'Failed to initialize payment gateway', 'error': str(e)}), 500

@app.route('/api/orders/verify', methods=['POST'])
@token_required
def verify_payment(current_user):
    data = request.get_json()
    razorpay_payment_id = data.get('razorpay_payment_id')
    razorpay_order_id = data.get('razorpay_order_id')
    razorpay_signature = data.get('razorpay_signature')
    
    if not all([razorpay_payment_id, razorpay_order_id, razorpay_signature]):
        return jsonify({'message': 'Missing payment verification details'}), 400
        
    try:
        is_dummy = os.environ.get("RAZORPAY_KEY_ID") == "rzp_test_dummy"
        
        if not is_dummy:
            razorpay_client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            })
        
        order = Order.query.filter_by(razorpay_order_id=razorpay_order_id).first()
        if order:
            order.status = "paid"
            order.razorpay_payment_id = razorpay_payment_id
            db.session.commit()
            return jsonify({'message': 'Payment successful', 'order': order.to_dict()}), 200
        else:
            return jsonify({'message': 'Order not found'}), 404
            
    except razorpay.errors.SignatureVerificationError:
        return jsonify({'message': 'Payment verification failed'}), 400
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/orders/me', methods=['GET'])
@token_required
def get_my_orders(current_user):
    orders = Order.query.filter_by(user_id=current_user.id).order_by(Order.id.desc()).all()
    return jsonify([order.to_dict() for order in orders]), 200

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "true").lower() == "true"
    app.run(debug=debug, port=port)
