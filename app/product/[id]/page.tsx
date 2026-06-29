import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Star, Truck, ShieldCheck, ArrowLeft } from "lucide-react";

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  // Placeholder data based on id
  const product = {
    id: params.id,
    name: "Classic Saffron Kurta",
    price: "₹1,499",
    description: "Experience the elegance of traditional Indian wear with this beautifully crafted Saffron Kurta. Made from premium quality breathable cotton, it ensures maximum comfort throughout the day. Perfect for festive occasions, family gatherings, or casual outings.",
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?auto=format&fit=crop&q=80&w=800&h=1000",
      "https://images.unsplash.com/photo-1601288496920-b6154fe3626a?auto=format&fit=crop&q=80&w=800&h=1000",
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Saffron", "White", "Navy"],
  };

  return (
    <div className="container px-4 md:px-8 py-8">
      <Link href="/shop" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop
      </Link>
      
      <div className="grid md:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-[4/5] relative rounded-xl overflow-hidden bg-muted">
            <img 
              src={product.images[0]} 
              alt={product.name} 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img, i) => (
              <div key={i} className="aspect-square relative rounded-lg overflow-hidden border-2 border-transparent hover:border-primary cursor-pointer transition-colors bg-muted">
                <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <p className="text-2xl font-medium text-primary">{product.price}</p>
              <div className="flex items-center text-accent text-sm">
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current text-muted-foreground/30" />
                <span className="text-muted-foreground ml-2">(124 reviews)</span>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          <Separator />

          {/* Selections */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Color</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map(color => (
                  <Button key={color} variant="outline" className="rounded-full">
                    {color}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Size</h3>
                <Link href="#" className="text-sm text-primary underline">Size Guide</Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <Button key={size} variant="outline" className="w-12 h-12">
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button size="lg" className="flex-1 text-lg">Add to Cart</Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 pt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <span>Free Delivery over ₹999</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span>100% Secure Payment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
