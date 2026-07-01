'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Spline from '@splinetool/react-spline';
import { useCartStore, Product } from '@/lib/store/cartStore';
import { getProducts } from '@/lib/api';

const categories = [
  { name: 'Tops', icon: '👕', description: 'T-shirts, shirts & more', color: 'from-indigo-500/20 to-indigo-600/5' },
  { name: 'Bottoms', icon: '👖', description: 'Pants, jeans & chinos', color: 'from-purple-500/20 to-purple-600/5' },
  { name: 'Outerwear', icon: '🧥', description: 'Jackets, coats & more', color: 'from-blue-500/20 to-blue-600/5' },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState<number | null>(null);
  const { addItem } = useCartStore();

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (product: Product) => {
    addItem(product);
    setAdded(product.id);
    setTimeout(() => setAdded(null), 1500);
  };

  return (
    <>
      {/* 3D Hero Section */}
      <section className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden">
        {/* 3D Background */}
        <div className="absolute inset-0 z-0">
          <Spline scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" />
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/10 via-transparent to-[#080808]" />

        {/* Hero Text */}
        <div className="relative z-[2] text-center pointer-events-none px-6">
          <p className="text-indigo-400 text-sm font-semibold tracking-[0.3em] uppercase mb-4">New Collection 2026</p>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-indigo-300 leading-none mb-6">
            Future<br />Cloth
          </h1>
          <p className="text-neutral-400 text-lg max-w-md mx-auto mb-8">
            Experience fashion in the next dimension. Premium pieces crafted for the modern era.
          </p>
          <div className="flex gap-4 justify-center pointer-events-auto">
            <Link
              href="/shop"
              id="hero-shop-btn"
              className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-indigo-400 hover:text-white transition-all duration-300 hover:scale-105"
            >
              Shop Now
            </Link>
            <Link
              href="/shop"
              className="px-8 py-3 border border-white/20 text-white rounded-full hover:border-indigo-400 hover:text-indigo-400 transition-all duration-300"
            >
              View All
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-semibold tracking-tight mb-10">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/shop?category=${cat.name}`}
              className={`group relative rounded-2xl p-8 bg-gradient-to-br ${cat.color} border border-white/5 hover:border-indigo-500/40 transition-all duration-300 hover:scale-[1.02]`}
            >
              <div className="text-4xl mb-4">{cat.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-1">{cat.name}</h3>
              <p className="text-neutral-500 text-sm">{cat.description}</p>
              <span className="absolute bottom-6 right-6 text-neutral-600 group-hover:text-indigo-400 transition-colors text-xl">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Arrivals */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-3xl font-semibold tracking-tight">Latest Arrivals</h2>
          <Link href="/shop" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-neutral-900/50 rounded-2xl h-80 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.slice(0, 3).map((product) => (
              <div key={product.id} className="group bg-neutral-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-indigo-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10">
                <Link href={`/product/${product.id}`}>
                  <div className="h-56 bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-500 cursor-pointer">
                    {product.category === 'Tops' ? '👕' : product.category === 'Bottoms' ? '👖' : '🧥'}
                  </div>
                </Link>
                <div className="p-5">
                  <span className="text-xs text-indigo-400 font-medium uppercase tracking-wider">{product.category}</span>
                  <Link href={`/product/${product.id}`}>
                    <h3 className="text-lg font-semibold text-white mt-1 hover:text-indigo-300 transition-colors">{product.name}</h3>
                  </Link>
                  <p className="text-neutral-500 text-sm mt-1 line-clamp-2">{product.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-2xl font-light">${product.price}</span>
                    <button
                      id={`add-to-cart-${product.id}`}
                      onClick={() => handleAddToCart(product)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        added === product.id
                          ? 'bg-green-500 text-white scale-95'
                          : 'bg-white text-black hover:bg-indigo-500 hover:text-white'
                      }`}
                    >
                      {added === product.id ? '✓ Added!' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 p-12 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-600/10 via-transparent to-transparent" />
          <h2 className="relative text-4xl font-bold mb-4">Ready to redefine your style?</h2>
          <p className="relative text-neutral-400 mb-8 max-w-lg mx-auto">
            Explore our full collection and find your perfect look.
          </p>
          <Link
            href="/shop"
            id="cta-shop-btn"
            className="inline-block px-10 py-4 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-500 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/30"
          >
            Explore Collection
          </Link>
        </div>
      </section>
    </>
  );
}
