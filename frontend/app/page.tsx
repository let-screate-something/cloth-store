'use client';

import { useEffect, useState } from 'react';
import Spline from '@splinetool/react-spline';
import { useCartStore, Product } from '@/lib/store/cartStore';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const { addItem, items } = useCartStore();

  useEffect(() => {
    // Fetch products from the Python Flask backend
    // NEXT_PUBLIC_API_URL is set in .env.local for dev and Vercel env vars for production
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    fetch(`${apiUrl}/api/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Failed to fetch products", err));
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-indigo-500 selection:text-white">
      {/* 3D Hero Section */}
      <section className="relative w-full h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-70">
          <Spline scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" />
        </div>
        <div className="z-10 text-center pointer-events-none">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white to-purple-300 drop-shadow-lg">
            Future Cloth
          </h1>
          <p className="mt-4 text-xl text-neutral-300 max-w-lg mx-auto">
            Experience fashion in the next dimension. Interact with our 3D space above.
          </p>
        </div>
      </section>

      {/* Product List Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-4xl font-semibold tracking-tight">Latest Arrivals</h2>
          <div className="text-neutral-400">Cart: {items.reduce((acc, item) => acc + item.quantity, 0)} items</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="group relative bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-indigo-500 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/20">
              <div className="h-48 w-full bg-neutral-800 rounded-xl mb-6 flex items-center justify-center text-neutral-500 group-hover:scale-[1.02] transition-transform duration-300">
                [Image Placeholder]
              </div>
              <h3 className="text-xl font-medium">{product.name}</h3>
              <p className="text-neutral-400 mt-2 text-sm">{product.description}</p>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-2xl font-light">${product.price}</span>
                <button
                  onClick={() => addItem(product)}
                  className="px-4 py-2 bg-white text-black rounded-full font-medium hover:bg-indigo-400 hover:text-white transition-colors duration-200"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
