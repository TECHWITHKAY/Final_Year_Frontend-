import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllCommodities } from '@/api/commodities';
import { getLatestPrices } from '@/api/public';
import { CommodityCard } from '@/components/shared/CommodityCard';

const categories = ['All', 'Grains', 'Vegetables', 'Tubers', 'Fruits', 'Legumes'];

const CommoditiesPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const { data: commodities, isLoading } = useQuery({
    queryKey: ['commodities'],
    queryFn: () => getAllCommodities().then(r => r.data?.data || r.data || []),
    staleTime: 10 * 60_000,
  });

  const { data: prices } = useQuery({
    queryKey: ['latest-prices'],
    queryFn: () => getLatestPrices().then(r => r.data?.data || r.data || []),
    staleTime: 5 * 60_000,
  });

  const filtered = activeCategory === 'All'
    ? commodities
    : commodities?.filter((c: any) => c.category === activeCategory);

  const getPriceForCommodity = (name: string) =>
    prices?.find((p: any) => (p.commodity || p.commodityName) === name);

  return (
    <div className="space-y-8">
      {/* Page Header Banner */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50/40 border border-green-100 rounded-2xl p-8 shadow-sm">
        <h1 className="heading-accent font-display text-3xl font-extrabold text-[#1B5E20]">Commodity Intelligence</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl">Track prices, seasonal patterns, and volatility for Ghana's essential food commodities.</p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-3">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
              activeCategory === cat
                ? 'bg-[#1B5E20] text-white shadow-md'
                : 'bg-transparent border border-muted-foreground/30 text-muted-foreground hover:border-[#1B5E20] hover:text-[#1B5E20] hover:bg-green-50/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Commodity Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card-ghana p-6"><div className="shimmer h-40 rounded" /></div>
            ))
          : (filtered || []).map((commodity: any, i: number) => {
              const price = getPriceForCommodity(commodity.name);
              return (
                <CommodityCard
                  key={commodity.id || commodity.name}
                  commodity={commodity}
                  priceData={price}
                  index={i}
                />
              );
            })}
      </div>
    </div>
  );
};

export default CommoditiesPage;
