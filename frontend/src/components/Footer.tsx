import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-black mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 mb-3">
              FutureCloth
            </h3>
            <p className="text-neutral-500 text-sm leading-relaxed max-w-xs">
              Fashion reimagined for the next generation. Premium clothing crafted with precision and style.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">Shop</h4>
            <ul className="space-y-3">
              {[
                { href: '/shop', label: 'All Products' },
                { href: '/shop?category=Tops', label: 'Tops' },
                { href: '/shop?category=Bottoms', label: 'Bottoms' },
                { href: '/shop?category=Outerwear', label: 'Outerwear' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-neutral-500 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">Info</h4>
            <ul className="space-y-3">
              {[
                { href: '/about', label: 'About Us' },
                { href: '/cart', label: 'Cart' },
                { href: '/login', label: 'Login' },
                { href: '/register', label: 'Register' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-neutral-500 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-neutral-600 text-xs">
            © {year} FutureCloth. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {/* Social Icons */}
            <a href="#" aria-label="Instagram" className="text-neutral-600 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a href="#" aria-label="Twitter" className="text-neutral-600 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
