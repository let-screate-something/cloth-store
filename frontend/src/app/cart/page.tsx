'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCartStore } from '@/lib/store/cartStore';
import { useAuthStore } from '@/lib/store/authStore';
import { placeOrder, verifyPayment } from '@/lib/api';
import Script from 'next/script';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, addItem, updateQuantity, clearCart } = useCartStore();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  const subtotal = items.reduce((acc, item) => acc + (item.variant.price || item.product.base_price) * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    if (!token) {
      router.push('/login');
      return;
    }
    
    try {
      setLoading(true);
      // Map items for the API
      const apiItems = items.map(item => ({
        variant_id: item.variant_id,
        quantity: item.quantity
      }));
      // 1. Create order on backend
      const res = await placeOrder(apiItems, token);
      
      // 2. Initialize Razorpay Checkout
      const rzpKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_dummy';
      
      // Simulated Payment Bypass for Dummy Keys
      if (rzpKey === 'rzp_test_dummy') {
        const confirmPayment = window.confirm(
          `[SIMULATED RAZORPAY CHECKOUT]\n\nDo you want to simulate paying ₹${(res.amount / 100).toFixed(2)} for Order #${res.order_id}?`
        );
        
        if (confirmPayment) {
          try {
            await verifyPayment({
              razorpay_payment_id: `pay_dummy_${Math.floor(Math.random() * 1000000)}`,
              razorpay_order_id: res.razorpay_order_id,
              razorpay_signature: 'dummy_signature_xyz'
            }, token);
            setOrderId(res.order_id);
            clearCart();
            alert('Simulated payment successful! Your order has been placed.');
          } catch (verifyErr) {
            alert('Payment verification failed.');
          }
        }
        setLoading(false);
        return;
      }

      const options = {
        key: rzpKey,
        amount: res.amount,
        currency: res.currency,
        name: 'Future Cloth',
        description: 'Store Purchase',
        order_id: res.razorpay_order_id,
        handler: async function (response: any) {
          try {
            // 3. Verify payment on backend
            await verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            }, token);
            
            setOrderId(res.order_id);
            clearCart();
            alert('Payment successful! Your order has been placed.');
          } catch (verifyErr) {
            alert('Payment verification failed.');
          }
        },
        theme: {
          color: '#4f46e5' // indigo-600
        }
      };

      // @ts-ignore
      const rzp1 = new window.Razorpay(options);
      rzp1.open();

    } catch (err) {
      alert('Failed to initialize checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
    <>
    <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-5xl font-bold tracking-tight">Your Cart</h1>
        <p className="text-neutral-500 mt-2">{items.reduce((a, i) => a + i.quantity, 0)} items</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const primaryImage = item.product.images?.find(i => i.is_primary)?.image_url || item.product.images?.[0]?.image_url;
            const price = item.variant.price || item.product.base_price;
            
            return (
            <div key={item.variant_id} className="bg-neutral-900/50 border border-white/5 rounded-2xl p-5 flex gap-5 items-start hover:border-indigo-500/20 transition-all">
              {/* Image */}
              <div className="w-20 h-20 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl flex items-center justify-center text-3xl shrink-0 border border-white/5 overflow-hidden">
                {primaryImage ? (
                  <img src={primaryImage} alt={item.product.name} className="w-full h-full object-cover" />
                ) : (
                  <>👗</>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-indigo-400 font-medium uppercase tracking-wider">{item.product.slug?.split('-')[0] || 'Apparel'}</span>
                    <h3 className="text-base font-semibold text-white mt-0.5">{item.product.name}</h3>
                    <p className="text-neutral-500 text-sm mt-0.5">Size: {item.variant.size} {item.variant.color ? `| Color: ${item.variant.color}` : ''}</p>
                    <p className="text-neutral-500 text-sm mt-1">₹{price.toFixed(2)} each</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.variant_id)}
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
                      onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 transition-all text-sm"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm font-semibold text-white ml-auto">
                    ₹{(price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )})}

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
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-400">Free</span> : `₹${shipping.toFixed(2)}`}</span>
              </div>
              {subtotal < 100 && (
                <p className="text-xs text-neutral-600">Add ₹{(100 - subtotal).toFixed(2)} more for free shipping</p>
              )}
              <div className="border-t border-white/5 pt-3 flex justify-between text-base font-semibold text-white">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              id="checkout-btn"
              onClick={handleCheckout}
              disabled={loading}
              className={`w-full mt-6 py-4 bg-indigo-600 text-white font-semibold rounded-xl transition-all duration-300 ${
                loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/20'
              }`}
            >
              {loading ? 'Processing...' : (token ? 'Proceed to Checkout' : 'Login to Checkout')}
            </button>
            <Link href="/shop" className="block text-center mt-3 text-sm text-neutral-500 hover:text-white transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

