'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { FiSearch, FiHeart, FiShoppingCart, FiMenu, FiX, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../lib/api';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, user } = useAuth();
  const { cart, goToCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { label: 'Home', href: '/' },
    { label: 'Sarees', href: '/categories' },
    { label: 'Accessories', href: '/accessories' },
    { label: 'Herbal Products', href: '/herbal-products' },
    { label: 'Wishlist', href: '/wishlist' },
    { label: 'My Account', href: isLoggedIn ? '/account' : '/login' },
  ];

  // Search suggestions states
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState({ categories: [], products: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const desktopContainerRef = useRef(null);
  const mobileContainerRef = useRef(null);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedDesktop = desktopContainerRef.current && desktopContainerRef.current.contains(event.target);
      const clickedMobile = mobileContainerRef.current && mobileContainerRef.current.contains(event.target);
      if (!clickedDesktop && !clickedMobile) {
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
      {/* ================= DESKTOP HEADER ================= */}
      <div className="max-w-7xl mx-auto px-4 py-3 hidden md:flex items-center justify-between gap-4">
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
        <div ref={desktopContainerRef} className="flex-1 max-w-md relative">
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

          {/* Desktop Autocomplete Dropdown */}
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

        {/* Desktop Icons */}
        <div className="flex items-center gap-4 text-gold text-xl">
          <Link href="/wishlist" className="hover:text-gold-light transition">
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
            className="flex w-9 h-9 rounded-full bg-gold/20 items-center justify-center text-sm font-bold"
          >
            {isLoggedIn ? (user?.name?.[0]?.toUpperCase() || 'U') : 'Sign in'}
          </Link>
        </div>
      </div>

      {/* ================= MOBILE HEADER ================= */}
      <div className="max-w-7xl mx-auto px-3 py-2.5 flex md:hidden items-center justify-between gap-1 w-full h-16 bg-maroon-dark">
        {/* Hamburger Menu Icon */}
        <button 
          className="text-gold text-2xl w-10 h-10 flex items-center justify-center flex-shrink-0 hover:text-gold-light transition"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
 
        {/* Myntra-style Rounded Search Box */}
        <div ref={mobileContainerRef} className="flex-1 min-w-0 relative mx-1">
          <div className="flex items-center bg-[#290d11] border border-gold/30 rounded-full pl-3 pr-3.5 h-11 w-full">
            {/* Logo replaces the 'M' letter from Myntra reference */}
            <img
              src="/logo.jpg"
              alt="Logo"
              className="w-7 h-7 rounded-full border border-gold/40 object-cover flex-shrink-0 mr-2"
            />
            {/* Input field with Myntra placeholder */}
            <input
              type="text"
              placeholder="Search for sarees, collections, colors..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleSearchSubmit}
              onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
              className="bg-transparent text-cream placeholder-cream/40 text-[11px] outline-none w-full min-w-0 py-1"
            />
            {/* Right search icon inside the field */}
            <button 
              onClick={triggerSearch} 
              className="text-gold/70 hover:text-gold flex-shrink-0 ml-1.5 w-6 h-6 flex items-center justify-center"
            >
              <FiSearch className="text-base" />
            </button>
          </div>
 
          {/* Mobile Autocomplete Suggestions */}
          {showSuggestions && (suggestions.categories.length > 0 || suggestions.products.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-maroon-dark border border-gold/20 rounded-lg shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto divide-y divide-gold/10">
              {suggestions.categories.length > 0 && (
                <div className="p-2">
                  <p className="text-gold text-[9px] uppercase font-bold tracking-wider px-2 mb-1">Categories</p>
                  {suggestions.categories.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/category/${c.slug}`}
                      onClick={() => setShowSuggestions(false)}
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
                      onClick={() => setShowSuggestions(false)}
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
 
        {/* Mobile Icons: Wishlist, Profile, Cart */}
        <div className="flex items-center gap-1 text-gold text-xl flex-shrink-0">
          {/* Wishlist */}
          <Link 
            href="/wishlist" 
            className="w-10 h-10 flex items-center justify-center hover:text-gold-light transition"
          >
            <FiHeart />
          </Link>
          
          {/* Profile/Account */}
          <Link 
            href={isLoggedIn ? '/account' : '/login'} 
            className="w-10 h-10 flex items-center justify-center hover:text-gold-light transition"
          >
            <FiUser />
          </Link>
 
          {/* Cart */}
          <button 
            onClick={goToCart} 
            className="relative w-10 h-10 flex items-center justify-center hover:text-gold-light transition"
          >
            <FiShoppingCart />
            {cart.summary.itemCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-gold text-maroon-dark text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-maroon-dark">
                {cart.summary.itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ================= REDESIGNED MOBILE MENU DRAWER ================= */}
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 md:hidden ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none invisible'
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Drawer Panel */}
      <div 
        className={`fixed inset-y-0 left-0 w-[85%] max-w-[360px] bg-[#2b0810] border-r border-gold/20 z-55 flex flex-col md:hidden transition-all duration-300 transform ${
          menuOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none invisible'
        }`}
      >
        {/* Header Row */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gold/15 h-16 bg-[#2b0810] shrink-0">
          <button onClick={() => setMenuOpen(false)} className="text-gold text-2xl w-8 h-8 flex items-center justify-center hover:text-gold-light transition">
            <FiX />
          </button>
          
          {/* Mobile Drawer Search Box */}
          <div className="flex-1 relative min-w-0">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleSearchSubmit}
              className="w-full bg-[#130305] border border-gold/25 rounded-full pl-3 pr-8 py-1.5 text-xs text-cream placeholder-cream/40 outline-none"
            />
            <button onClick={triggerSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-gold/70 text-sm">
              <FiSearch />
            </button>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-2 text-gold text-xl flex-shrink-0">
            <Link 
              href="/wishlist" 
              onClick={(e) => { e.preventDefault(); router.push('/wishlist'); setMenuOpen(false); }} 
              className="hover:text-gold-light transition p-1"
            >
              <FiHeart />
            </Link>
            <Link 
              href={isLoggedIn ? '/account' : '/login'} 
              onClick={(e) => { e.preventDefault(); router.push(isLoggedIn ? '/account' : '/login'); setMenuOpen(false); }} 
              className="hover:text-gold-light transition p-1"
            >
              <FiUser />
            </Link>
            <button 
              onClick={(e) => { e.preventDefault(); goToCart(); setMenuOpen(false); }} 
              className="relative hover:text-gold-light transition p-1"
            >
              <FiShoppingCart />
              {cart.summary.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold text-maroon-dark text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center border border-maroon-dark">
                  {cart.summary.itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Drawer Menu Links */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <div key={item.label} className="border-b border-gold/10 pb-3">
                <Link
                  href={item.href}
                  onClick={(e) => { e.preventDefault(); router.push(item.href); setMenuOpen(false); }}
                  className={`block text-[18px] font-medium tracking-wide transition-colors ${
                    isActive ? 'text-gold font-bold' : 'text-cream/90 hover:text-gold'
                  }`}
                >
                  {item.label}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
}
