import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables from .env file (local development only)
load_dotenv()

app = Flask(__name__)

# Read allowed frontend origin from env — defaults to localhost for local dev
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

# Restrict CORS to only the known frontend URL for security
CORS(app, origins=[FRONTEND_URL])

# Dummy data for the cloth store
# TODO: Replace with a real database (SQLAlchemy + PostgreSQL) in a future phase
products = [
    {
        "id": 1,
        "name": "Classic White T-Shirt",
        "price": 29.99,
        "category": "Tops",
        "description": "A high-quality, comfortable cotton t-shirt perfect for everyday wear."
    },
    {
        "id": 2,
        "name": "Denim Jacket",
        "price": 89.99,
        "category": "Outerwear",
        "description": "Stylish and durable denim jacket for a classic look."
    },
    {
        "id": 3,
        "name": "Black Chino Pants",
        "price": 59.99,
        "category": "Bottoms",
        "description": "Versatile black chinos that can be dressed up or down."
    }
]

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

@app.route('/api/products', methods=['GET'])
def get_products():
    return jsonify(products), 200

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = next((p for p in products if p['id'] == product_id), None)
    if product:
        return jsonify(product), 200
    return jsonify({"error": "Product not found"}), 404

if __name__ == '__main__':
    # In production, gunicorn will start the server — this block is for local dev only
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "true").lower() == "true"
    app.run(debug=debug, port=port)
