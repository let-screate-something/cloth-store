'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { getProducts, createProduct } from '@/lib/api';

export default function AdminPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      setError('Please select an image');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      await createProduct({
        name,
        price: parseFloat(price),
        category,
        description,
        image
      });
      
      // Reset form
      setName('');
      setPrice('');
      setCategory('');
      setDescription('');
      setImage(null);
      // @ts-ignore
      document.getElementById('image-upload').value = '';
      
      // Reload products
      await loadProducts();
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || !user.is_admin) return null;

  return (
    <main className="min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-2xl p-6 h-fit">
          <h2 className="text-xl font-bold mb-6">Add New Product</h2>
          
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
                <option value="Tops">Tops</option>
                <option value="Bottoms">Bottoms</option>
                <option value="Outerwear">Outerwear</option>
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
                required
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600"
              />
            </div>
            
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? 'Uploading...' : 'Create Product'}
            </button>
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
    </main>
  );
}
