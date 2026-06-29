import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, Minus, Plus, ArrowRight } from "lucide-react";

export default function CartPage() {
  // Placeholder cart data
  const cartItems = [
    { 
      id: "1", 
      name: "Classic Saffron Kurta", 
      price: 1499, 
      quantity: 1,
      size: "M",
      color: "Saffron",
      image: "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?auto=format&fit=crop&q=80&w=400&h=500" 
    },
    { 
      id: "2", 
      name: "Maroon Silk Saree", 
      price: 3999, 
      quantity: 1,
      size: "Free Size",
      color: "Maroon",
      image: "https://images.unsplash.com/photo-1583391733958-692cb0020108?auto=format&fit=crop&q=80&w=400&h=500" 
    },
  ];

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal + shipping;

  return (
    <div className="container px-4 md:px-8 py-12">
      <h1 className="text-3xl font-heading font-bold mb-8">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items */}
        <div className="flex-1 space-y-6">
          {cartItems.map((item) => (
            <Card key={item.id} className="border-none shadow-sm bg-background">
              <CardContent className="p-4 flex gap-4">
                <div className="h-24 w-20 shrink-0 rounded-md overflow-hidden bg-muted">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
                
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">Size: {item.size} | Color: {item.color}</p>
                    </div>
                    <p className="font-medium text-primary">₹{item.price}</p>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center gap-2 border rounded-md">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none">
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-4 text-center text-sm">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-[400px]">
          <Card className="bg-muted/50 border-none shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹{total}</span>
                </div>
              </div>

              <Button size="lg" className="w-full mt-8" asChild>
                <Link href="/checkout">
                  Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
