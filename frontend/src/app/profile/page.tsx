'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { getOrders } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, token, logout } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We delay the redirect slightly to avoid hydration mismatch 
    // when Zustand reads from localStorage
    const timeout = setTimeout(() => {
      if (!user) {
        router.push('/login');
      }
    }, 100);

    if (user && token) {
      getOrders(token)
        .then((data) => {
          setOrders(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }

    return () => clearTimeout(timeout);
  }, [user, token, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-8 backdrop-blur-xl group hover:border-indigo-500/50 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 p-1 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-3xl font-bold">
                {(user.name || user.full_name || user.email || user.phone || 'U').charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold tracking-tight mb-1">{user.name || user.full_name || 'FutureCloth Member'}</h1>
              <p className="text-neutral-400">{user.email || user.phone || 'No contact info'}</p>
              {user.is_admin && (
                <span className="inline-block mt-3 px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/30">
                  Admin Account
                </span>
              )}
            </div>
            <button 
              onClick={() => { logout(); router.push('/'); }}
              className="px-6 py-2.5 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500 transition-all duration-300"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Orders Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Order History</h2>
          
          {loading ? (
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-24 bg-white/5 rounded-2xl"></div>
                <div className="h-24 bg-white/5 rounded-2xl"></div>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-3xl bg-white/5 border border-white/10 p-12 text-center backdrop-blur-xl transition-all duration-300 hover:bg-white/10">
              <div className="w-16 h-16 mx-auto mb-4 text-neutral-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">No orders yet</h3>
              <p className="text-neutral-400 mb-6">You haven't placed any orders with FutureCloth yet.</p>
              <Link href="/shop" className="inline-block px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-indigo-400 hover:text-white transition-all duration-300">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <div key={order.id} className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl hover:bg-white/10 transition-colors duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-neutral-400">Order #{order.id}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${order.status === 'Paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-300">Transaction: {order.razorpay_order_id || 'N/A'}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-lg font-bold">${order.total_amount.toFixed(2)}</p>
                    <p className="text-xs text-neutral-500 mt-1">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
