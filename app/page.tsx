import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Star } from "lucide-react";

export default function Home() {
  const categories = [
    { name: "Men", href: "/shop?category=men", image: "https://images.unsplash.com/photo-1550246140-5119ae4790b8?auto=format&fit=crop&q=80&w=600&h=800" },
    { name: "Women", href: "/shop?category=women", image: "https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?auto=format&fit=crop&q=80&w=600&h=800" },
    { name: "Kids", href: "/shop?category=kids", image: "https://images.unsplash.com/photo-1519238382717-386fb4b50c05?auto=format&fit=crop&q=80&w=600&h=800" },
  ];

  const featuredProducts = [
    { id: "1", name: "Classic Saffron Kurta", price: "₹1,499", image: "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?auto=format&fit=crop&q=80&w=400&h=500" },
    { id: "2", name: "Maroon Silk Saree", price: "₹3,999", image: "https://images.unsplash.com/photo-1583391733958-692cb0020108?auto=format&fit=crop&q=80&w=400&h=500" },
    { id: "3", name: "Golden Embroidery Suit", price: "₹2,599", image: "https://images.unsplash.com/photo-1601288496920-b6154fe3626a?auto=format&fit=crop&q=80&w=400&h=500" },
    { id: "4", name: "Kids Cotton Ethnic Wear", price: "₹999", image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&q=80&w=400&h=500" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-muted py-20 md:py-32 overflow-hidden">
        <div className="container px-4 md:px-8 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 max-w-xl">
            <h1 className="text-4xl md:text-6xl font-heading font-bold tracking-tight text-foreground">
              Discover Authentic Indian Elegance
            </h1>
            <p className="text-lg text-muted-foreground">
              Experience the perfect blend of tradition and contemporary style. Shop the finest collections of men's, women's, and kids' wear at Surya Cloth.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild className="rounded-full">
                <Link href="/shop">
                  Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-full">
                <Link href="/shop?category=new">View New Arrivals</Link>
              </Button>
            </div>
          </div>
          <div className="hidden md:block relative h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl">
            {/* Placeholder for Hero Image */}
            <img 
              src="https://images.unsplash.com/photo-1583391733958-692cb0020108?auto=format&fit=crop&q=80&w=800&h=1000" 
              alt="Indian Fashion" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-background">
        <div className="container px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-foreground">Shop by Category</h2>
              <p className="text-muted-foreground">Explore our exclusive collections tailored just for you.</p>
            </div>
            <Button variant="link" asChild className="text-primary hover:text-primary/80">
              <Link href="/categories">View All Categories <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link key={category.name} href={category.href} className="group relative overflow-hidden rounded-xl aspect-[3/4] block">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                  <span className="text-white/80 flex items-center text-sm font-medium">
                    Shop Collection <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-muted/50">
        <div className="container px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-foreground">Trending Now</h2>
            <p className="text-muted-foreground">Handpicked favorites that our customers are loving right now.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                <div className="relative aspect-[4/5] overflow-hidden group">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 bg-background/90 backdrop-blur rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm">
                    <Star className="h-4 w-4 text-accent" />
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <Button className="w-full shadow-lg">Quick Add</Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg truncate mb-1">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-primary font-medium">{product.price}</p>
                    <div className="flex text-accent">
                      <Star className="h-3 w-3 fill-current" />
                      <Star className="h-3 w-3 fill-current" />
                      <Star className="h-3 w-3 fill-current" />
                      <Star className="h-3 w-3 fill-current" />
                      <Star className="h-3 w-3 fill-current" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Button size="lg" variant="outline" asChild className="rounded-full">
              <Link href="/shop">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quality Promise / Testimonial */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-8 text-center max-w-4xl mx-auto space-y-8">
          <Star className="h-12 w-12 mx-auto text-accent fill-accent" />
          <h2 className="text-3xl md:text-5xl font-heading font-bold leading-tight">
            "The quality and craftsmanship of Surya Cloth is unmatched. Every piece feels like it was custom made just for me."
          </h2>
          <p className="text-lg text-primary-foreground/80">— Priya S., Verified Buyer</p>
        </div>
      </section>
    </div>
  );
}
