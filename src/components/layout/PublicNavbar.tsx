import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export const PublicNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-display ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur-md py-3 shadow-md border-b' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl transform group-hover:scale-110 transition-transform">🇬🇭</span>
          <span className={`text-xl font-bold tracking-tight transition-colors ${
            isScrolled ? 'text-primary' : 'text-primary-foreground'
          }`}>
            CommodityGH
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link 
            to="/dashboard" 
            className={`text-sm font-semibold transition-colors hover:text-accent ${
              isScrolled ? 'text-foreground' : 'text-primary-foreground'
            }`}
          >
            Dashboard
          </Link>
          <div className={`h-4 w-px ${isScrolled ? 'bg-border' : 'bg-primary-foreground/20'}`} />
          <Link 
            to="/login" 
            className={`text-sm font-semibold transition-colors hover:text-accent ${
              isScrolled ? 'text-foreground' : 'text-primary-foreground'
            }`}
          >
            Login
          </Link>
          <Link 
            to="/register" 
            className="rounded-lg bg-accent px-5 py-2 text-sm font-bold text-accent-foreground shadow-lg hover:opacity-90 transition active:scale-95"
          >
            Register
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className={`md:hidden p-2 transition-colors ${
            isScrolled ? 'text-foreground' : 'text-primary-foreground'
          }`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b shadow-xl p-4 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
          <Link 
            to="/dashboard" 
            className="text-lg font-semibold py-2 border-b"
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link 
            to="/login" 
            className="text-lg font-semibold py-2 border-b"
            onClick={() => setMobileMenuOpen(false)}
          >
            Login
          </Link>
          <Link 
            to="/register" 
            className="bg-accent text-accent-foreground text-center py-3 rounded-lg font-bold"
            onClick={() => setMobileMenuOpen(false)}
          >
            Register
          </Link>
        </div>
      )}
    </nav>
  );
};
