import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function CheckoutPage() {
  return (
    <div className="container px-4 md:px-8 py-12">
      <h1 className="text-3xl font-heading font-bold mb-8">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Shipping details */}
        <div className="flex-1 space-y-8">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="First Name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Last Name" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="123 Main St, Apartment, Studio, or floor" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="City" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" placeholder="State" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">PIN Code</Label>
                  <Input id="zip" placeholder="PIN Code" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="Phone Number" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary & Payment */}
        <div className="w-full lg:w-[400px]">
          <Card className="bg-muted/50 border-none shadow-sm sticky top-24">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-6">Your Order</h2>
              
              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-10 bg-muted rounded overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?auto=format&fit=crop&q=80&w=100&h=120" alt="Product" className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <p className="font-medium">Classic Saffron Kurta</p>
                      <p className="text-muted-foreground text-xs">Size: M | Qty: 1</p>
                    </div>
                  </div>
                  <span className="font-medium">₹1,499</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-10 bg-muted rounded overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1583391733958-692cb0020108?auto=format&fit=crop&q=80&w=100&h=120" alt="Product" className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <p className="font-medium">Maroon Silk Saree</p>
                      <p className="text-muted-foreground text-xs">Size: Free | Qty: 1</p>
                    </div>
                  </div>
                  <span className="font-medium">₹3,999</span>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹5,498</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">Free</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹5,498</span>
                </div>
              </div>

              <Button size="lg" className="w-full mt-8">
                Pay with Razorpay
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
