import os
import jwt
from functools import wraps
import cloudinary
import cloudinary.uploader
import razorpay
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from models import db, Product, User, Order, OrderItem

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
            if not current_user or not current_user.is_admin:
                return jsonify({'message': 'Admin privileges required!'}), 403
        except Exception as e:
            return jsonify({'message': 'Token is invalid!'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

# --- Routes ---

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({'message': 'Missing required fields'}), 400
        
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'User already exists'}), 409
        
    new_user = User(name=data['name'], email=data['email'])
    new_user.set_password(data['password'])
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing email or password'}), 400
        
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'message': 'Invalid email or password'}), 401
        
    token = jwt.encode({'user_id': user.id, 'email': user.email}, app.config['SECRET_KEY'], algorithm="HS256")
    
    return jsonify({
        'token': token,
        'user': {'id': user.id, 'name': user.name, 'email': user.email, 'is_admin': user.is_admin}
    }), 200

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_me(current_user):
    return jsonify({'id': current_user.id, 'name': current_user.name, 'email': current_user.email, 'is_admin': current_user.is_admin}), 200

@app.route('/api/orders', methods=['POST'])
@token_required
def place_order(current_user):
    data = request.get_json()
    items = data.get('items', [])
    if not items:
        return jsonify({'message': 'Cart is empty'}), 400
        
    total = sum(item['price'] * item['quantity'] for item in items)
    shipping = 0 if total > 100 else 9.99
    final_total = total + shipping
    
    # Create DB Order first (Pending)
    new_order = Order(user_id=current_user.id, total=final_total, status="Pending")
    db.session.add(new_order)
    db.session.flush() # To get the new_order.id
    
    # Add OrderItems
    for item in items:
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=item['id'],
            quantity=item['quantity'],
            price_at_time=item['price']
        )
        db.session.add(order_item)
        
    db.session.commit()
    
    try:
        # Check if using dummy keys
        is_dummy = os.environ.get("RAZORPAY_KEY_ID") == "rzp_test_dummy"
        amount_in_paise = int(final_total * 100)
        
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
        
        # Mark order as Paid
        order = Order.query.filter_by(razorpay_order_id=razorpay_order_id).first()
        if order:
            order.status = "Paid"
            order.razorpay_payment_id = razorpay_payment_id
            db.session.commit()
            return jsonify({'message': 'Payment successful', 'order_id': order.id}), 200
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

@app.route('/api/admin/orders', methods=['GET'])
@admin_required
def get_all_orders(current_user):
    orders = Order.query.order_by(Order.id.desc()).all()
    return jsonify([{
        **order.to_dict(),
        "user_email": order.user.email if order.user else "Unknown"
    } for order in orders]), 200

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

@app.route('/api/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([p.to_dict() for p in products]), 200

@app.route('/api/products', methods=['POST'])
@admin_required
def create_product(current_user):
    if 'image' not in request.files:
        return jsonify({'message': 'No image provided'}), 400
        
    file = request.files['image']
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400

    name = request.form.get('name')
    price = request.form.get('price')
    category = request.form.get('category')
    description = request.form.get('description')
    
    if not all([name, price, category]):
        return jsonify({'message': 'Missing required fields'}), 400
        
    try:
        # Upload image to Cloudinary
        upload_result = cloudinary.uploader.upload(file)
        image_url = upload_result.get('secure_url')
        
        # Create product in DB
        new_product = Product(
            name=name,
            price=float(price),
            category=category,
            description=description,
            image_url=image_url
        )
        db.session.add(new_product)
        db.session.commit()
        
        return jsonify({'message': 'Product created successfully', 'product': new_product.to_dict()}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = Product.query.get(product_id)
    if product:
        return jsonify(product.to_dict()), 200
    return jsonify({"error": "Product not found"}), 404

@app.route('/api/products/<int:product_id>', methods=['PUT', 'PATCH'])
@admin_required
def update_product(current_user, product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"message": "Product not found"}), 404

    name = request.form.get('name')
    price = request.form.get('price')
    category = request.form.get('category')
    description = request.form.get('description')

    if name:
        product.name = name
    if price:
        product.price = float(price)
    if category:
        product.category = category
    if description:
        product.description = description

    if 'image' in request.files and request.files['image'].filename != '':
        try:
            upload_result = cloudinary.uploader.upload(request.files['image'])
            product.image_url = upload_result.get('secure_url')
        except Exception as e:
            return jsonify({'message': str(e)}), 500

    db.session.commit()
    return jsonify({'message': 'Product updated successfully', 'product': product.to_dict()}), 200
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "true").lower() == "true"
    app.run(debug=debug, port=port)
