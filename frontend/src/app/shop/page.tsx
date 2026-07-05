'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Product } from '@/lib/store/cartStore';
import { getProducts } from '@/lib/api';

const CATEGORIES = ['All', "Men's Clothing", "Women's Clothing", 'T-Shirts', 'Jackets', 'Dresses'];
const SORT_OPTIONS = [
  { label: 'Default', value: 'default' },
  { label: 'Price: Low → High', value: 'asc' },
  { label: 'Price: High → Low', value: 'desc' },
];

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('default');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat) setCategory(cat);

    getProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = products
    .filter((p) => category === 'All' || p.slug.includes(category.toLowerCase().replace(/[' ]/g, ''))) // Basic filter by slug since category string is gone
    .sort((a, b) => {
      if (sort === 'asc') return a.base_price - b.base_price;
      if (sort === 'desc') return b.base_price - a.base_price;
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <p className="text-indigo-400 text-xs font-semibold tracking-[0.3em] uppercase mb-2">Collection</p>
        <h1 className="text-5xl font-bold tracking-tight">Shop</h1>
        <p className="text-neutral-500 mt-2">{filtered.length} products</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Filters */}
        <aside className="lg:w-56 shrink-0">
          <div className="sticky top-24">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-4">Category</h3>
            <ul className="space-y-1">
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => setCategory(cat)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      category === cat
                        ? 'bg-indigo-600 text-white'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>

            <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mt-8 mb-4">Sort By</h3>
            <ul className="space-y-1">
              {SORT_OPTIONS.map((opt) => (
                <li key={opt.value}>
                  <button
                    onClick={() => setSort(opt.value)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      sort === opt.value
                        ? 'bg-indigo-600 text-white'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-neutral-900/50 rounded-2xl h-80 animate-pulse border border-white/5" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <p className="text-5xl mb-4">🛍️</p>
              <p className="text-neutral-400 text-lg">No products found</p>
              <button onClick={() => setCategory('All')} className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm">
                Clear filters
              </button>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
            >
              {filtered.map((product) => {
                const primaryImage = product.images?.find(i => i.is_primary)?.image_url || product.images?.[0]?.image_url;
                const defaultVariant = product.variants?.find((v: any) => v.size === 'Default') || product.variants?.[0];
                const stock = defaultVariant?.stock_quantity || 0;
                const isOutOfStock = stock <= 0;
                const discount = product.discount_percent || 0;
                const finalPrice = discount > 0 ? product.base_price * (1 - discount/100) : product.base_price;

                return (
                  <motion.div 
                    key={product.id} 
                    variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                    className="group bg-neutral-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-indigo-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 relative"
                  >
                    {discount > 0 && (
                      <div className="absolute top-4 left-4 z-10 bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                        {discount}% OFF
                      </div>
                    )}
                    {isOutOfStock && (
                      <div className="absolute top-4 right-4 z-10 bg-red-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md">
                        OUT OF STOCK
                      </div>
                    )}
                    <Link href={`/product/${product.slug || product.id}`}>
                      {primaryImage ? (
                        <div className="h-52 overflow-hidden relative group-hover:scale-110 transition-transform duration-500 cursor-pointer">
                          <img src={primaryImage} alt={product.name} className="w-full h-full object-cover" />
                          {isOutOfStock && <div className="absolute inset-0 bg-black/40" />}
                        </div>
                      ) : (
                        <div className="h-52 bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500 cursor-pointer relative">
                          👗
                          {isOutOfStock && <div className="absolute inset-0 bg-black/40" />}
                        </div>
                      )}
                    </Link>
                    <div className="p-5">
                      <span className="text-xs text-indigo-400 font-medium uppercase tracking-wider">{product.slug.split('-')[0]}</span>
                      <Link href={`/product/${product.slug || product.id}`}>
                        <h3 className="text-base font-semibold text-white mt-1 hover:text-indigo-300 transition-colors">{product.name}</h3>
                      </Link>
                      <p className="text-neutral-500 text-xs mt-1 line-clamp-2">{product.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex flex-col">
                          {discount > 0 ? (
                            <>
                              <span className="text-xl font-light text-white">₹{finalPrice.toFixed(2)}</span>
                              <span className="text-xs text-neutral-500 line-through">₹{product.base_price.toFixed(2)}</span>
                            </>
                          ) : (
                            <span className="text-xl font-light text-white">₹{product.base_price.toFixed(2)}</span>
                          )}
                        </div>
                        <Link href={`/product/${product.slug || product.id}`}>
                          <button
                            className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 bg-white text-black hover:bg-indigo-500 hover:text-white"
                          >
                            View Details
                          </button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
