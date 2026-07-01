'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCartStore, Product } from '@/lib/store/cartStore';
import { getProduct } from '@/lib/api';

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCartStore();

  useEffect(() => {
    const id = Number(params.id);
    getProduct(id)
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const emoji = product?.category === 'Tops' ? '👕' : product?.category === 'Bottoms' ? '👖' : '🧥';

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="h-[500px] bg-neutral-900 rounded-3xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-6 w-24 bg-neutral-800 rounded animate-pulse" />
            <div className="h-10 w-3/4 bg-neutral-800 rounded animate-pulse" />
            <div className="h-8 w-20 bg-neutral-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <p className="text-5xl mb-4">🔍</p>
        <h2 className="text-2xl font-semibold mb-2">Product not found</h2>
        <Link href="/shop" className="mt-4 text-indigo-400 hover:text-indigo-300">← Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-10">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
        <span>/</span>
        <span className="text-white">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Product Image */}
        <div className="relative h-[500px] bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-3xl flex items-center justify-center border border-white/5 overflow-hidden group">
          <span className="text-[120px] group-hover:scale-110 transition-transform duration-500">{emoji}</span>
          <span className="absolute top-4 left-4 bg-indigo-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide">
            {product.category}
          </span>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <p className="text-indigo-400 text-xs font-semibold tracking-[0.3em] uppercase mb-2">{product.category}</p>
          <h1 className="text-4xl font-bold tracking-tight mb-4">{product.name}</h1>
          <p className="text-4xl font-light text-white mb-6">${product.price}</p>

          <p className="text-neutral-400 leading-relaxed mb-8">{product.description}</p>

          {/* Size Selector */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">Size</h3>
              <span className="text-sm text-indigo-400">Size Guide →</span>
            </div>
            <div className="flex gap-2">
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-12 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                    selectedSize === size
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-white/10 text-neutral-400 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-400 mb-3">Quantity</h3>
            <div className="flex items-center gap-3 w-fit border border-white/10 rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-12 h-12 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
              >
                −
              </button>
              <span className="w-8 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-12 h-12 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            id="product-add-to-cart"
            onClick={handleAddToCart}
            className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
              added
                ? 'bg-green-500 text-white scale-[0.98]'
                : 'bg-white text-black hover:bg-indigo-600 hover:text-white hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/20'
            }`}
          >
            {added ? '✓ Added to Cart!' : 'Add to Cart'}
          </button>

          <Link href="/shop" className="text-center mt-4 text-neutral-500 hover:text-white text-sm transition-colors">
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
