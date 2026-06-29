import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminOrdersPage() {
  const orders = [
    { id: "#ORD-001", customer: "Priya Sharma", date: "Oct 24, 2026", total: "₹5,498", status: "Processing" },
    { id: "#ORD-002", customer: "Rahul Verma", date: "Oct 23, 2026", total: "₹1,499", status: "Shipped" },
    { id: "#ORD-003", customer: "Anjali Singh", date: "Oct 21, 2026", total: "₹3,999", status: "Delivered" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold mb-2">Orders</h1>
        <p className="text-muted-foreground">View and manage customer orders.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-3 font-medium">Order ID</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-primary">{order.id}</td>
                  <td className="px-6 py-4">{order.customer}</td>
                  <td className="px-6 py-4 text-muted-foreground">{order.date}</td>
                  <td className="px-6 py-4 font-medium">{order.total}</td>
                  <td className="px-6 py-4 text-right">
                    <Badge variant={order.status === "Delivered" ? "default" : order.status === "Processing" ? "secondary" : "outline"}>
                      {order.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
