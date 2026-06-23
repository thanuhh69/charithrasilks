'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiHeart, FiShoppingCart, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../lib/api';

export default function Header() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const { cart, goToCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  // Search suggestions states
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState({ categories: [], products: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef(null);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = async (val) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSuggestions({ categories: [], products: [] });
      return;
    }
    try {
      const { data } = await api.get('/products/search/suggestions', { params: { q: val } });
      if (data.success) {
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const triggerSearch = () => {
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-maroon-dark border-b border-gold/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <button className="md:hidden text-gold text-2xl" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition">
          <img
            src="/logo.jpg"
            alt="Charithra Silks Logo"
            className="w-8 h-8 rounded-full border border-gold/40 object-cover flex-shrink-0"
          />
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-gold text-lg md:text-2xl font-bold tracking-wide">
              CHARITHRA
            </span>
            <span className="text-cream/70 text-xs tracking-widest">SILKS</span>
          </div>
        </Link>

        {/* Desktop Search */}
        <div ref={containerRef} className="hidden md:flex flex-1 max-w-md relative">
          <input
            type="text"
            placeholder="Search for sarees, categories..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleSearchSubmit}
            onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
            className="input-field pl-4 pr-10 py-2 w-full"
          />
          <button onClick={triggerSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gold/70 hover:text-gold transition">
            <FiSearch />
          </button>

          {/* Autocomplete Dropdown */}
          {showSuggestions && (suggestions.categories.length > 0 || suggestions.products.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-maroon-dark border border-gold/20 rounded-lg shadow-xl z-50 overflow-hidden max-h-96 overflow-y-auto divide-y divide-gold/10">
              {suggestions.categories.length > 0 && (
                <div className="p-2">
                  <p className="text-gold text-[10px] uppercase font-bold tracking-wider px-2 mb-1">Categories</p>
                  {suggestions.categories.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/category/${c.slug}`}
                      onClick={() => setShowSuggestions(false)}
                      className="block px-2 py-1.5 hover:bg-gold/10 rounded text-sm text-cream transition"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
              {suggestions.products.length > 0 && (
                <div className="p-2">
                  <p className="text-gold text-[10px] uppercase font-bold tracking-wider px-2 mb-1">Products</p>
                  {suggestions.products.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/product/${p.slug}`}
                      onClick={() => setShowSuggestions(false)}
                      className="flex items-center gap-3 px-2 py-1.5 hover:bg-gold/10 rounded text-sm text-cream transition"
                    >
                      <div className="w-8 h-10 bg-maroon rounded overflow-hidden flex-shrink-0 relative">
                        {p.thumbnail && <img src={p.thumbnail} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{p.title}</p>
                        <p className="text-xs text-cream/50">{p.categoryName}</p>
                      </div>
                      <span className="text-gold font-semibold text-xs">₹{p.price.toLocaleString('en-IN')}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-gold text-xl">
          <Link href="/wishlist" className="hidden sm:block hover:text-gold-light transition">
            <FiHeart />
          </Link>
          <button onClick={goToCart} className="relative hover:text-gold-light transition">
            <FiShoppingCart />
            {cart.summary.itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-maroon-dark text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {cart.summary.itemCount}
              </span>
            )}
          </button>
          <Link
            href={isLoggedIn ? '/account' : '/login'}
            className="hidden sm:flex w-9 h-9 rounded-full bg-gold/20 items-center justify-center text-sm font-bold"
          >
            {isLoggedIn ? (user?.name?.[0]?.toUpperCase() || 'U') : 'Sign in'}
          </Link>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-maroon-dark border-t border-gold/20 px-4 py-3 flex flex-col gap-3 text-cream relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for sarees, categories..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleSearchSubmit}
              onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
              className="input-field pl-4 pr-10 py-2 w-full"
            />
            <button onClick={triggerSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gold/70 hover:text-gold transition">
              <FiSearch />
            </button>

            {/* Mobile Dropdown Suggestions */}
            {showSuggestions && (suggestions.categories.length > 0 || suggestions.products.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-maroon-dark border border-gold/20 rounded-lg shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto divide-y divide-gold/10">
                {suggestions.categories.length > 0 && (
                  <div className="p-2">
                    <p className="text-gold text-[9px] uppercase font-bold tracking-wider px-2 mb-1">Categories</p>
                    {suggestions.categories.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/category/${c.slug}`}
                        onClick={() => { setShowSuggestions(false); setMenuOpen(false); }}
                        className="block px-2 py-1.5 hover:bg-gold/10 rounded text-xs text-cream transition"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                )}
                {suggestions.products.length > 0 && (
                  <div className="p-2">
                    <p className="text-gold text-[9px] uppercase font-bold tracking-wider px-2 mb-1">Products</p>
                    {suggestions.products.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/product/${p.slug}`}
                        onClick={() => { setShowSuggestions(false); setMenuOpen(false); }}
                        className="flex items-center gap-2 px-2 py-1.5 hover:bg-gold/10 rounded text-xs text-cream transition"
                      >
                        <div className="w-6 h-8 bg-maroon rounded overflow-hidden flex-shrink-0 relative">
                          {p.thumbnail && <img src={p.thumbnail} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-xs">{p.title}</p>
                        </div>
                        <span className="text-gold font-semibold text-xs">₹{p.price.toLocaleString('en-IN')}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/categories" onClick={() => setMenuOpen(false)}>Categories</Link>
          <Link href="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist</Link>
          <Link href={isLoggedIn ? '/account' : '/login'} onClick={() => setMenuOpen(false)}>
            {isLoggedIn ? 'My Account' : 'Sign In'}
          </Link>
        </div>
      )}
    </header>
  );
}
