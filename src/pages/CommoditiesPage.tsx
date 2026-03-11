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
    <div className="space-y-6">
      <div>
        <h1 className="heading-accent font-display text-2xl font-bold text-foreground">Commodity Intelligence</h1>
        <p className="mt-2 text-muted-foreground">Track prices, seasonal patterns, and volatility for Ghana's essential food commodities.</p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              activeCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Commodity Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
