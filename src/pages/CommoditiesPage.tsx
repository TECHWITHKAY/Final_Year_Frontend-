import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCommodities } from '@/api/commodities';
import { getLatestPrices } from '@/api/priceRecords';
import { CommodityIcon } from '@/components/shared/CommodityIcon';
import { PriceChangeTag } from '@/components/shared/PriceChangeTag';
import { formatPrice } from '@/utils/formatters';

const categories = ['All', 'Grains', 'Vegetables', 'Tubers', 'Fruits', 'Legumes'];

const CommoditiesPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const { data: commodities, isLoading } = useQuery({
    queryKey: ['commodities'],
    queryFn: () => getCommodities().then(r => r.data?.data || r.data || []),
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
                <motion.div
                  key={commodity.id || i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card-ghana p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <CommodityIcon name={commodity.name} size="lg" />
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                      {commodity.category || 'General'}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-xl font-bold text-foreground">{commodity.name}</h3>
                  <p className="text-xs text-muted-foreground">per {commodity.unit || 'kg'}</p>
                  <div className="mt-3 flex items-end justify-between">
                    <p className="font-mono text-2xl font-bold text-primary">
                      {formatPrice(price?.avgPrice || price?.price)}
                    </p>
                    <PriceChangeTag value={price?.percentChange} />
                  </div>
                  <Link
                    to={`/commodities/${commodity.id}`}
                    className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
                  >
                    View Details →
                  </Link>
                </motion.div>
              );
            })}
      </div>
    </div>
  );
};

export default CommoditiesPage;
