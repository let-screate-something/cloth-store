"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { useEffect, useState } from "react";

export default function CartPage() {
  // Hydration fix for Zustand persist
  const [mounted, setMounted] = useState(false);
  
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="container px-4 md:px-8 py-12 min-h-screen">Loading cart...</div>;
  }

  const subtotal = getSubtotal();
  const shipping = subtotal > 999 ? 0 : (items.length > 0 ? 99 : 0);
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="container px-4 md:px-8 py-12 min-h-[calc(100vh-16rem)] flex flex-col items-center justify-center text-center">
        <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-heading font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Button size="lg" asChild>
          <Link href="/shop">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container px-4 md:px-8 py-12">
      <h1 className="text-3xl font-heading font-bold mb-8">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items */}
        <div className="flex-1 space-y-6">
          {items.map((item) => (
            <Card key={`${item.id}-${item.size}-${item.color}`} className="border-none shadow-sm bg-background">
              <CardContent className="p-4 flex gap-4">
                <div className="h-24 w-20 shrink-0 rounded-md overflow-hidden bg-muted">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
                
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex justify-between">
                    <div>
                      <Link href={`/product/${item.id}`}>
                        <h3 className="font-semibold text-lg hover:text-primary transition-colors">{item.name}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">Size: {item.size} | Color: {item.color}</p>
                    </div>
                    <p className="font-medium text-primary">₹{item.price}</p>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center gap-2 border rounded-md">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-none"
                        onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-4 text-center text-sm">{item.quantity}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-none"
                        onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => removeItem(item.id, item.size, item.color)}
                    >
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
