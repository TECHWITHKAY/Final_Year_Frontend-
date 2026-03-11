import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Package, Store, MapPin, Clock, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getDashboardSummary, getLatestPrices } from '@/api/priceRecords';
import { getHealthScores } from '@/api/health';
import { getMonthlyTrend, getCityComparison } from '@/api/analytics';
import { StatCard } from '@/components/ui/StatCard';
import { PriceChangeTag } from '@/components/shared/PriceChangeTag';
import { GradeTag } from '@/components/shared/GradeTag';
import { GatePrompt } from '@/components/shared/GatePrompt';
import { CommodityIcon } from '@/components/shared/CommodityIcon';
import { PriceTrendChart } from '@/components/charts/PriceTrendChart';
import { CityComparisonChart } from '@/components/charts/CityComparisonChart';
import { formatPrice, formatDate } from '@/utils/formatters';
import { COMMODITIES, CHART_COLORS } from '@/utils/constants';

const DashboardPage: React.FC = () => {
  const { isAuthenticated, hasRole } = useAuth();
  const [selectedCommodity, setSelectedCommodity] = useState('1');

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => getDashboardSummary().then(r => r.data?.data || r.data),
    staleTime: 5 * 60_000,
  });

  const { data: latestPrices, isLoading: pricesLoading } = useQuery({
    queryKey: ['latest-prices'],
    queryFn: () => getLatestPrices().then(r => r.data?.data || r.data || []),
    staleTime: 5 * 60_000,
  });

  const { data: healthScores } = useQuery({
    queryKey: ['health-scores'],
    queryFn: () => getHealthScores().then(r => r.data?.data || r.data || []),
    staleTime: 10 * 60_000,
  });

  const { data: cityData } = useQuery({
    queryKey: ['city-comparison', selectedCommodity],
    queryFn: () => getCityComparison(selectedCommodity).then(r => r.data?.data || r.data || []),
    enabled: isAuthenticated,
    staleTime: 5 * 60_000,
  });

  return (
    <div className="space-y-6">
      {/* Guest banner */}
      {!isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-ghana-gold-light border border-accent p-4 flex flex-col sm:flex-row items-center justify-between gap-3"
        >
          <p className="text-sm font-medium text-foreground">👋 You're viewing a preview. Sign in for full historical data, city breakdowns, and export tools.</p>
          <div className="flex gap-2">
            <Link to="/register" className="rounded-md bg-accent px-4 py-1.5 text-sm font-bold text-accent-foreground hover:opacity-90">Create Free Account</Link>
            <Link to="/login" className="rounded-md border border-primary px-4 py-1.5 text-sm font-medium text-primary hover:bg-secondary">Sign In</Link>
          </div>
        </motion.div>
      )}

      <h1 className="heading-accent font-display text-2xl font-bold text-foreground">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Commodities" value={summary?.totalCommodities || 6} icon={Package} loading={summaryLoading} />
        <StatCard title="Markets" value={summary?.totalMarkets || 10} icon={Store} loading={summaryLoading} />
        <StatCard title="Cities" value={summary?.totalCities || 5} icon={MapPin} loading={summaryLoading} />
        <StatCard title="Last Updated" value={summary?.lastUpdated ? formatDate(summary.lastUpdated) : 'Today'} icon={Clock} loading={summaryLoading} animate={false} />
      </div>

      {/* Latest Prices */}
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">Today's National Averages</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(Array.isArray(latestPrices) ? latestPrices.slice(0, 6) : []).map((item: any, i: number) => (
            <motion.div
              key={item.commodity || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-ghana p-4 flex items-center gap-4"
            >
              <CommodityIcon name={item.commodity || item.commodityName} size="lg" />
              <div className="flex-1">
                <p className="font-semibold text-foreground">{item.commodity || item.commodityName}</p>
                <p className="font-mono text-xl font-bold text-primary">{formatPrice(item.avgPrice || item.price)}</p>
                <p className="text-xs text-muted-foreground">per {item.unit || 'kg'}</p>
              </div>
              <PriceChangeTag value={item.percentChange} />
            </motion.div>
          ))}
          {pricesLoading && Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card-ghana p-4">
              <div className="shimmer h-16 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Market Health */}
      {Array.isArray(healthScores) && healthScores.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">Market Health Overview</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {healthScores.map((market: any) => (
              <div key={market.marketId || market.market} className="card-ghana p-4 min-w-[200px] flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-foreground text-sm">{market.marketName || market.market}</p>
                  <GradeTag grade={market.grade} size="sm" />
                </div>
                <p className="text-xs text-muted-foreground">{market.cityName || market.city}</p>
                {!isAuthenticated && <p className="mt-2 text-xs text-muted-foreground italic">🔒 Details require sign-in</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Authenticated: City Comparison */}
      {isAuthenticated && (
        <div className="card-ghana p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-foreground">City Price Comparison</h2>
            <select
              value={selectedCommodity}
              onChange={e => setSelectedCommodity(e.target.value)}
              className="rounded-md border border-input bg-card px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {COMMODITIES.map((c, i) => (
                <option key={c} value={String(i + 1)}>{c}</option>
              ))}
            </select>
          </div>
          {cityData && <CityComparisonChart data={Array.isArray(cityData) ? cityData : []} />}
        </div>
      )}

      {/* Gate for guests */}
      {!isAuthenticated && (
        <GatePrompt message="Full analytics, trends, and city comparisons available with a free account." />
      )}

      {/* Admin widget */}
      {hasRole('ADMIN') && (
        <div className="card-ghana kente-accent p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">Pending Submissions</p>
              <p className="text-sm text-muted-foreground">{summary?.pendingCount || 0} records awaiting review</p>
            </div>
            <Link to="/admin/pending" className="text-sm font-medium text-primary hover:underline">Review Now →</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
