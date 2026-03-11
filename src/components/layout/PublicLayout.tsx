import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export const PublicLayout: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Outlet />
    <footer className="border-t-4 border-primary bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🇬🇭</span>
            <span className="font-display text-lg font-bold">CommodityGH</span>
          </div>
          <nav className="flex gap-6 text-sm opacity-80">
            <Link to="/dashboard" className="hover:opacity-100 transition">Dashboard</Link>
            <Link to="/login" className="hover:opacity-100 transition">Login</Link>
            <Link to="/register" className="hover:opacity-100 transition">Register</Link>
          </nav>
          <p className="text-xs opacity-60">Built for Ghana's markets. Powered by open data.</p>
        </div>
      </div>
    </footer>
  </div>
);
