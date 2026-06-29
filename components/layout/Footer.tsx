import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-12 mt-auto">
      <div className="container px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-2xl text-primary">Surya Cloth</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Premium Indian fashion for Men, Women, and Kids. Crafting style with elegance.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-lg">Shop</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/shop?category=men" className="hover:text-primary transition-colors">Men's Collection</Link></li>
            <li><Link href="/shop?category=women" className="hover:text-primary transition-colors">Women's Collection</Link></li>
            <li><Link href="/shop?category=kids" className="hover:text-primary transition-colors">Kids' Collection</Link></li>
            <li><Link href="/shop" className="hover:text-primary transition-colors">New Arrivals</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-lg">Support</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            <li><Link href="/faq" className="hover:text-primary transition-colors">FAQs</Link></li>
            <li><Link href="/shipping" className="hover:text-primary transition-colors">Shipping & Returns</Link></li>
            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-lg">Newsletter</h4>
          <p className="text-sm text-muted-foreground">
            Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
          </p>
          <form className="flex gap-2">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex h-10 w-full rounded-md border border-input bg-background/10 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button type="submit" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
              Subscribe
            </button>
          </form>
        </div>
      </div>
      
      <div className="container px-4 md:px-8 mt-12 pt-8 border-t border-muted-foreground/20 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Surya Cloth. All rights reserved.</p>
      </div>
    </footer>
  );
}
