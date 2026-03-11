import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getCommodity } from '@/api/commodities';
import { getPriceRange } from '@/api/priceRecords';
import { getMonthlyTrend, getCityComparison, getInflation, getForecast } from '@/api/analytics';
import { getSeasonalData } from '@/api/seasonal';
import { StatCard } from '@/components/ui/StatCard';
import { CommodityIcon } from '@/components/shared/CommodityIcon';
import { PriceChangeTag } from '@/components/shared/PriceChangeTag';
import { GatePrompt } from '@/components/shared/GatePrompt';
import { PriceTrendChart } from '@/components/charts/PriceTrendChart';
import { CityComparisonChart } from '@/components/charts/CityComparisonChart';
import { SeasonalChart } from '@/components/charts/SeasonalChart';
import { formatPrice, formatPercentage } from '@/utils/formatters';
import { DollarSign, TrendingUp, TrendingDown, Activity } from 'lucide-react';

const tabs = ['Overview', 'Price Trends', 'City Comparison', 'Seasonal', 'Analytics'];

const CommodityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [months, setMonths] = useState(12);

  const { data: commodity } = useQuery({
    queryKey: ['commodity', id],
    queryFn: () => getCommodity(id!).then(r => r.data?.data || r.data),
    enabled: !!id,
  });

  const { data: priceRange, isLoading: priceLoading } = useQuery({
    queryKey: ['price-range', id],
    queryFn: () => getPriceRange(id!).then(r => r.data?.data || r.data),
    enabled: !!id,
  });

  const { data: trendData } = useQuery({
    queryKey: ['trend', id, months],
    queryFn: () => getMonthlyTrend(id!, months).then(r => r.data?.data || r.data || []),
    enabled: !!id && isAuthenticated && activeTab === 'Price Trends',
  });

  const { data: cityData } = useQuery({
    queryKey: ['city-comparison', id],
    queryFn: () => getCityComparison(id!).then(r => r.data?.data || r.data || []),
    enabled: !!id && isAuthenticated && activeTab === 'City Comparison',
  });

  const { data: seasonalData } = useQuery({
    queryKey: ['seasonal', id],
    queryFn: () => getSeasonalData(id!).then(r => r.data?.data || r.data || []),
    enabled: !!id && activeTab === 'Seasonal',
  });

  const { data: forecast } = useQuery({
    queryKey: ['forecast', id],
    queryFn: () => getForecast(id!).then(r => r.data?.data || r.data),
    enabled: !!id && isAuthenticated && activeTab === 'Analytics',
  });

  const { data: inflation } = useQuery({
    queryKey: ['inflation', id],
    queryFn: () => getInflation(id!).then(r => r.data?.data || r.data),
    enabled: !!id && isAuthenticated && activeTab === 'Analytics',
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground">
        <Link to="/dashboard" className="hover:text-primary">Dashboard</Link>
        <span className="mx-2">/</span>
        <Link to="/commodities" className="hover:text-primary">Commodities</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium">{commodity?.name || '...'}</span>
      </nav>

      {/* Hero */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CommodityIcon name={commodity?.name || ''} size="lg" />
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">{commodity?.name}</h1>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">{commodity?.category}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-3xl font-bold text-primary">{formatPrice(priceRange?.avgPrice)}</p>
          <PriceChangeTag value={priceRange?.percentChange} />
        </div>
      </div>

      {!isAuthenticated && <GatePrompt message="Sign in for full price trends, city comparison, and analytics." />}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium transition border-b-2 ${
              activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Overview' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Avg Price" value={formatPrice(priceRange?.avgPrice)} icon={DollarSign} loading={priceLoading} animate={false} />
          <StatCard title="Min Price" value={formatPrice(priceRange?.minPrice)} icon={TrendingDown} loading={priceLoading} animate={false} />
          <StatCard title="Max Price" value={formatPrice(priceRange?.maxPrice)} icon={TrendingUp} loading={priceLoading} animate={false} />
          <StatCard title="Median" value={formatPrice(priceRange?.medianPrice)} icon={Activity} loading={priceLoading} animate={false} />
        </div>
      )}

      {activeTab === 'Price Trends' && (
        isAuthenticated ? (
          <div className="card-ghana p-6">
            <div className="flex gap-2 mb-4">
              {[3, 6, 12].map(m => (
                <button key={m} onClick={() => setMonths(m)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${months === m ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {m}M
                </button>
              ))}
            </div>
            <PriceTrendChart data={Array.isArray(trendData) ? trendData : []} />
          </div>
        ) : <GatePrompt />
      )}

      {activeTab === 'City Comparison' && (
        isAuthenticated ? (
          <div className="card-ghana p-6">
            <CityComparisonChart data={Array.isArray(cityData) ? cityData : []} />
          </div>
        ) : <GatePrompt />
      )}

      {activeTab === 'Seasonal' && (
        <div className="card-ghana p-6">
          <SeasonalChart data={Array.isArray(seasonalData) ? seasonalData : []} />
        </div>
      )}

      {activeTab === 'Analytics' && (
        isAuthenticated ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card-ghana p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">Inflation</h3>
              <p className="font-mono text-2xl font-bold" style={{ color: (inflation?.percentChange || 0) > 0 ? '#C62828' : '#1B5E20' }}>
                {formatPercentage(inflation?.percentChange)}
              </p>
              <p className="text-sm text-muted-foreground">vs last month</p>
            </div>
            <div className="card-ghana p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">Forecast</h3>
              <p className="font-mono text-2xl font-bold text-primary">{formatPrice(forecast?.forecastPrice)}</p>
              <p className="text-sm text-muted-foreground">Expected next month (3-month moving avg)</p>
            </div>
          </div>
        ) : <GatePrompt />
      )}
    </div>
  );
};

export default CommodityDetailPage;
