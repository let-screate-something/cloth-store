'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCartStore, Product, ProductVariant } from '@/lib/store/cartStore';
import { getProduct } from '@/lib/api';

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCartStore();

  useEffect(() => {
    const slugOrId = params.id as string;
    getProduct(slugOrId)
      .then((p) => {
        setProduct(p);
        if (p.variants && p.variants.length > 0) {
          setSelectedVariant(p.variants[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    addItem(product, selectedVariant, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const emoji = '👗';

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

  const primaryImage = product.images?.find(i => i.is_primary)?.image_url || product.images?.[0]?.image_url;
  const displayPrice = selectedVariant?.price || product.base_price;

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
          {primaryImage ? (
            <img src={primaryImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <span className="text-[120px] group-hover:scale-110 transition-transform duration-500">{emoji}</span>
          )}
          <span className="absolute top-4 left-4 bg-indigo-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide">
            {product.slug.split('-')[0]}
          </span>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <p className="text-indigo-400 text-xs font-semibold tracking-[0.3em] uppercase mb-2">Details</p>
          <h1 className="text-4xl font-bold tracking-tight mb-4">{product.name}</h1>
          <p className="text-4xl font-light text-white mb-6">₹{displayPrice.toFixed(2)}</p>

          <p className="text-neutral-400 leading-relaxed mb-8">{product.description}</p>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">Options</h3>
                <span className="text-sm text-indigo-400">Size Guide →</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    disabled={variant.stock_quantity <= 0}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                      variant.stock_quantity <= 0 
                        ? 'opacity-50 cursor-not-allowed border-white/5 text-neutral-600'
                        : selectedVariant?.id === variant.id
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-white/10 text-neutral-400 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {variant.size || ''} {variant.color ? `(${variant.color})` : ''} 
                    {variant.stock_quantity <= 0 && ' - Out of Stock'}
                  </button>
                ))}
              </div>
            </div>
          )}

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
            disabled={!selectedVariant || selectedVariant.stock_quantity <= 0}
            className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
              !selectedVariant || selectedVariant.stock_quantity <= 0
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : added
                  ? 'bg-green-500 text-white scale-[0.98]'
                  : 'bg-white text-black hover:bg-indigo-600 hover:text-white hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/20'
            }`}
          >
            {!selectedVariant ? 'Select an Option' : selectedVariant.stock_quantity <= 0 ? 'Out of Stock' : added ? '✓ Added to Cart!' : 'Add to Cart'}
          </button>

          <Link href="/shop" className="text-center mt-4 text-neutral-500 hover:text-white text-sm transition-colors">
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
