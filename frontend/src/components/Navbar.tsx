'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/store/cartStore';
import { useAuthStore } from '@/lib/store/authStore';

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const items = useCartStore((state) => state.items);
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/about', label: 'About' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 hover:from-indigo-300 hover:to-purple-300"
        >
          FutureCloth
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors duration-200 ${
                pathname === link.href
                  ? 'text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user?.is_admin && (
            <Link
              href="/admin"
              className={`text-sm font-medium transition-colors duration-200 ${
                pathname === '/admin' ? 'text-indigo-400' : 'text-indigo-300/60 hover:text-indigo-300'
              }`}
            >
              Admin Panel
            </Link>
          )}
        </div>

        {/* Right side — Cart + Mobile Menu */}
        <div className="flex items-center gap-4">
          {/* Auth Links & Cart Icon */}
          <div className="hidden md:flex items-center gap-6 mr-4 border-r border-white/10 pr-6">
            {user ? (
              <>
                <span className="text-sm text-neutral-300">Hi, {user.name.split(' ')[0]}</span>
                <button onClick={logout} className="text-sm text-neutral-400 hover:text-white transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-neutral-400 hover:text-white transition-colors">Login</Link>
                <Link href="/register" className="text-sm bg-white text-black px-4 py-1.5 rounded-full hover:bg-indigo-400 hover:text-white transition-all">Sign Up</Link>
              </>
            )}
          </div>

          <Link
            href="/cart"
            id="cart-icon"
            className="relative p-2 text-neutral-400 hover:text-white transition-colors"
            aria-label="Shopping cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-indigo-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 text-neutral-400 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-xl border-b border-white/5 px-6 pb-6 pt-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block py-3 text-sm font-medium border-b border-white/5 transition-colors ${
                pathname === link.href ? 'text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user?.is_admin && (
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className={`block py-3 text-sm font-medium border-b border-white/5 transition-colors ${
                pathname === '/admin' ? 'text-indigo-400' : 'text-indigo-300/60 hover:text-indigo-300'
              }`}
            >
              Admin Panel
            </Link>
          )}
          {user ? (
            <button
              onClick={() => {
                logout();
                setMenuOpen(false);
              }}
              className="block w-full text-left py-3 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
            >
              Logout ({user.name.split(' ')[0]})
            </button>
          ) : (
            <div className="flex flex-col mt-4 gap-3">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="block text-center py-2.5 text-sm font-medium text-white border border-white/20 rounded-xl hover:bg-white/5 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="block text-center py-2.5 text-sm font-medium bg-white text-black rounded-xl hover:bg-indigo-400 hover:text-white transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
