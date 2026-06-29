import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ShopPage() {
  // Placeholder data
  const products = [
    { id: "1", name: "Classic Saffron Kurta", price: "₹1,499", image: "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?auto=format&fit=crop&q=80&w=400&h=500" },
    { id: "2", name: "Maroon Silk Saree", price: "₹3,999", image: "https://images.unsplash.com/photo-1583391733958-692cb0020108?auto=format&fit=crop&q=80&w=400&h=500" },
    { id: "3", name: "Golden Embroidery Suit", price: "₹2,599", image: "https://images.unsplash.com/photo-1601288496920-b6154fe3626a?auto=format&fit=crop&q=80&w=400&h=500" },
    { id: "4", name: "Kids Cotton Ethnic Wear", price: "₹999", image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&q=80&w=400&h=500" },
    { id: "5", name: "Men's Casual Linen Shirt", price: "₹1,299", image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=400&h=500" },
    { id: "6", name: "Women's Floral Kurti", price: "₹899", image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=400&h=500" },
  ];

  const categories = ["All", "Men", "Women", "Kids", "Accessories"];

  return (
    <div className="container px-4 md:px-8 py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 shrink-0 space-y-8">
        <div>
          <h3 className="font-bold text-lg mb-4">Categories</h3>
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat}>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="font-bold text-lg mb-4">Price Range</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><label className="flex items-center gap-2"><input type="checkbox" className="rounded border-input" /> Under ₹1000</label></li>
            <li><label className="flex items-center gap-2"><input type="checkbox" className="rounded border-input" /> ₹1000 - ₹2000</label></li>
            <li><label className="flex items-center gap-2"><input type="checkbox" className="rounded border-input" /> ₹2000 - ₹5000</label></li>
            <li><label className="flex items-center gap-2"><input type="checkbox" className="rounded border-input" /> Over ₹5000</label></li>
          </ul>
        </div>
      </aside>

      {/* Product Grid */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-heading font-bold">All Products</h1>
          <div className="text-sm text-muted-foreground">Showing 1-6 of 24 results</div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`}>
              <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow group">
                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg truncate mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
                  <p className="text-primary font-medium">{product.price}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
