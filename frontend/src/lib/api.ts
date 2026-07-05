import { Product } from './store/cartStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${API_URL}/api/products`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function getProduct(idOrSlug: string | number): Promise<Product> {
  const res = await fetch(`${API_URL}/api/products/${idOrSlug}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Product not found');
  return res.json();
}

export async function getCategories() {
  const res = await fetch(`${API_URL}/api/categories`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Login failed');
  }
  return res.json();
}

export async function registerUser(full_name: string, email: string, password: string, phone: string, idToken: string) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name, email, password, phone, idToken }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Registration failed');
  }
  return res.json();
}

export async function firebaseLogin(idToken: string) {
  const res = await fetch(`${API_URL}/api/auth/firebase-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Login failed');
  }
  return res.json();
}

export async function placeOrder(items: any[], token: string) {
  const res = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to place order');
  }
  return res.json();
}

export async function createProduct(data: { name: string, price: number, category: string, description: string, image: File, discount_percent?: number, stock_quantity?: number }) {
  const token = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token;
  
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('price', data.price.toString());
  formData.append('category', data.category);
  formData.append('description', data.description);
  formData.append('image', data.image);
  if (data.discount_percent !== undefined) formData.append('discount_percent', data.discount_percent.toString());
  if (data.stock_quantity !== undefined) formData.append('stock_quantity', data.stock_quantity.toString());

  const res = await fetch(`${API_URL}/api/products`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData, // Do not set Content-Type, browser will set it to multipart/form-data with boundary
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create product');
  }
  return res.json();
}

export async function updateProduct(id: number, data: { name?: string, price?: number, category?: string, description?: string, image?: File | null, discount_percent?: number, stock_quantity?: number }) {
  const token = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token;
  
  const formData = new FormData();
  if (data.name) formData.append('name', data.name);
  if (data.price) formData.append('price', data.price.toString());
  if (data.category) formData.append('category', data.category);
  if (data.description) formData.append('description', data.description);
  if (data.image) formData.append('image', data.image);
  if (data.discount_percent !== undefined) formData.append('discount_percent', data.discount_percent.toString());
  if (data.stock_quantity !== undefined) formData.append('stock_quantity', data.stock_quantity.toString());

  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData,
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update product');
  }
  return res.json();
}

export async function verifyPayment(paymentDetails: any, token: string) {
  const res = await fetch(`${API_URL}/api/orders/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(paymentDetails),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Payment verification failed');
  }
  return res.json();
}

export async function getOrders(token: string) {
  const res = await fetch(`${API_URL}/api/orders/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to fetch orders');
  }
  return res.json();
}

export async function getAllOrders(token: string) {
  const res = await fetch(`${API_URL}/api/admin/orders`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to fetch all orders');
  }
  return res.json();
}
