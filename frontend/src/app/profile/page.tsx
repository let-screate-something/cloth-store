'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { getMyOrders } from '@/lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !user) {
      router.push('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const data = await getMyOrders(token);
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, user, router]);

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-neutral-400 mt-2">Welcome back, {user.name}!</p>
          <p className="text-neutral-500 text-sm">{user.email}</p>
        </div>
        <button
          onClick={() => { logout(); router.push('/'); }}
          className="mt-4 md:mt-0 px-6 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg transition-colors text-sm font-semibold"
        >
          Logout
        </button>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Order History</h2>
        
        {loading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-white/10 rounded"></div>
                <div className="h-4 bg-white/10 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-neutral-900/50 border border-white/5 p-8 rounded-2xl text-center">
            <p className="text-neutral-400 mb-4">You haven't placed any orders yet.</p>
            <button onClick={() => router.push('/shop')} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors">Start Shopping</button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6">
                <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Order #{order.id}</h3>
                    <p className="text-sm text-neutral-500">Status: <span className={order.status === 'Paid' ? 'text-green-400' : 'text-yellow-400'}>{order.status}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">₹{(order.total).toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {order.items && order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-neutral-800 rounded-lg overflow-hidden shrink-0 border border-white/5">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">🛍️</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{item.product_name}</p>
                        <p className="text-sm text-neutral-400">Qty: {item.quantity} × ₹{item.price_at_time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
