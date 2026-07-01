'use client';

import Link from 'next/link';
import { useCartStore } from '@/lib/store/cartStore';

export default function CartPage() {
  const { items, removeItem, addItem, updateQuantity, clearCart } = useCartStore();

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
        <div className="text-8xl mb-6">🛒</div>
        <h2 className="text-3xl font-bold mb-3">Your cart is empty</h2>
        <p className="text-neutral-500 mb-8 max-w-sm">
          Looks like you haven&apos;t added anything yet. Let&apos;s fix that!
        </p>
        <Link
          href="/shop"
          id="empty-cart-shop-btn"
          className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-500 transition-all duration-300 hover:scale-105"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-5xl font-bold tracking-tight">Your Cart</h1>
        <p className="text-neutral-500 mt-2">{items.reduce((a, i) => a + i.quantity, 0)} items</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-neutral-900/50 border border-white/5 rounded-2xl p-5 flex gap-5 items-start hover:border-indigo-500/20 transition-all">
              {/* Image */}
              <div className="w-20 h-20 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl flex items-center justify-center text-3xl shrink-0 border border-white/5">
                {item.category === 'Tops' ? '👕' : item.category === 'Bottoms' ? '👖' : '🧥'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-indigo-400 font-medium uppercase tracking-wider">{item.category}</span>
                    <h3 className="text-base font-semibold text-white mt-0.5">{item.name}</h3>
                    <p className="text-neutral-500 text-sm mt-1">${item.price} each</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-neutral-600 hover:text-red-400 transition-colors p-1 ml-2"
                    aria-label="Remove item"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center border border-white/10 rounded-lg overflow-hidden">
                    <button
                      className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-all text-sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-all text-sm"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm font-semibold text-white ml-auto">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Clear Cart */}
          <button
            onClick={clearCart}
            className="text-sm text-neutral-600 hover:text-red-400 transition-colors mt-2"
          >
            Clear all items
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-6">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-400">Free</span> : `$${shipping.toFixed(2)}`}</span>
              </div>
              {subtotal < 100 && (
                <p className="text-xs text-neutral-600">Add ${(100 - subtotal).toFixed(2)} more for free shipping</p>
              )}
              <div className="border-t border-white/5 pt-3 flex justify-between text-base font-semibold text-white">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              id="checkout-btn"
              className="w-full mt-6 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/20"
            >
              Proceed to Checkout
            </button>
            <Link href="/shop" className="block text-center mt-3 text-sm text-neutral-500 hover:text-white transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
