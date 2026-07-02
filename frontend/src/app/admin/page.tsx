'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { getProducts, createProduct, updateProduct, getAllOrders } from '@/lib/api';

export default function AdminPage() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'products'|'orders'>('products');
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If not logged in, or not admin, kick them out
    if (!user) {
      router.push('/login');
    } else if (!user.is_admin) {
      router.push('/');
    } else {
      loadProducts();
    }
  }, [user, router]);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    if (!token) return;
    setLoadingOrders(true);
    try {
      const data = await getAllOrders(token);
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders' && orders.length === 0) {
      loadOrders();
    }
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image && !editingProductId) {
      setError('Please select an image');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      if (editingProductId) {
        await updateProduct(editingProductId, {
          name,
          price: parseFloat(price),
          category,
          description,
          image
        });
      } else {
        await createProduct({
          name,
          price: parseFloat(price),
          category,
          description,
          image: image as File
        });
      }
      
      handleCancelEdit();
      await loadProducts();
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (product: any) => {
    setEditingProductId(product.id);
    setName(product.name);
    setPrice(product.price.toString());
    setCategory(product.category);
    setDescription(product.description);
    setImage(null);
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setName('');
    setPrice('');
    setCategory('');
    setDescription('');
    setImage(null);
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    setError('');
  };

  if (!user || !user.is_admin) return null;

  return (
    <main className="min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'products' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-neutral-400 hover:text-white'}`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'orders' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-neutral-400 hover:text-white'}`}
        >
          Orders
        </button>
      </div>
      
      {activeTab === 'products' && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-2xl p-6 h-fit">
          <h2 className="text-xl font-bold mb-6">{editingProductId ? 'Edit Product' : 'Add New Product'}</h2>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Product Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Price (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Category</label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select Category...</option>
                <option value="Kurtas">Kurtas</option>
                <option value="Sarees">Sarees</option>
                <option value="Sherwanis">Sherwanis</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Description</label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Product Image</label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                required={!editingProductId}
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600"
              />
              {editingProductId && <p className="text-xs text-neutral-500 mt-1">Leave empty to keep current image</p>}
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingProductId ? 'Update Product' : 'Create Product'}
              </button>
              {editingProductId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-lg transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        
        {/* Table Column */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 overflow-hidden flex flex-col">
          <h2 className="text-xl font-bold mb-6">Current Products</h2>
          
          <div className="overflow-x-auto flex-1">
            {loading ? (
              <p className="text-neutral-400">Loading products...</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 px-4 font-semibold text-neutral-400 text-sm">Image</th>
                    <th className="py-3 px-4 font-semibold text-neutral-400 text-sm">Name</th>
                    <th className="py-3 px-4 font-semibold text-neutral-400 text-sm">Category</th>
                    <th className="py-3 px-4 font-semibold text-neutral-400 text-sm">Price</th>
                    <th className="py-3 px-4 font-semibold text-neutral-400 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-12 h-12 object-cover rounded-md" />
                        ) : (
                          <div className="w-12 h-12 bg-neutral-800 rounded-md flex items-center justify-center text-xs text-neutral-500">None</div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium">{product.name}</td>
                      <td className="py-3 px-4 text-neutral-400">{product.category}</td>
                      <td className="py-3 px-4">₹{product.price.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <button 
                          onClick={() => handleEditClick(product)}
                          className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-neutral-500">No products found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 overflow-hidden">
          <h2 className="text-xl font-bold mb-6">All Orders</h2>
          <div className="overflow-x-auto">
            {loadingOrders ? (
              <p className="text-neutral-400">Loading orders...</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 px-4 font-semibold text-neutral-400 text-sm">Order ID</th>
                    <th className="py-3 px-4 font-semibold text-neutral-400 text-sm">Customer Email</th>
                    <th className="py-3 px-4 font-semibold text-neutral-400 text-sm">Items</th>
                    <th className="py-3 px-4 font-semibold text-neutral-400 text-sm">Total</th>
                    <th className="py-3 px-4 font-semibold text-neutral-400 text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 font-medium">#{order.id}</td>
                      <td className="py-3 px-4 text-neutral-400">{order.user_email}</td>
                      <td className="py-3 px-4 text-sm text-neutral-400">
                        {order.items?.map((item: any) => `${item.quantity}x ${item.product_name}`).join(', ') || 'N/A'}
                      </td>
                      <td className="py-3 px-4">₹{order.total.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${order.status === 'Paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-neutral-500">No orders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
