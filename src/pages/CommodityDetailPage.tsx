import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getCommodityById } from '@/api/commodities';
import { getPriceRange } from '@/api/public';
import { getMonthlyTrend, getCityComparison, getInflationTrend, getForecast } from '@/api/analytics';
import { getSeasonalPatterns } from '@/api/seasonal';
import { StatCard } from '@/components/ui/StatCard';
import { CommodityIcon } from '@/components/shared/CommodityIcon';
import { PriceChangeTag } from '@/components/shared/PriceChangeTag';
import { GatePrompt } from '@/components/shared/GatePrompt';
import { PriceTrendChart } from '@/components/charts/PriceTrendChart';
import { CityComparisonChart } from '@/components/charts/CityComparisonChart';
import { SeasonalChart } from '@/components/charts/SeasonalChart';
import { formatPrice, formatPercentage } from '@/utils/formatters';
import { DollarSign, TrendingUp, TrendingDown, Activity, Leaf } from 'lucide-react';

const tabs = ['Overview', 'Price Trends', 'City Comparison', 'Seasonal', 'Analytics'];

const CommodityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [months, setMonths] = useState(12);

  const { data: commodity } = useQuery({
    queryKey: ['commodity', id],
    queryFn: () => getCommodityById(id!).then(r => r.data?.data || r.data),
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
    enabled: !!id && isAuthenticated && (activeTab === 'Price Trends' || activeTab === 'Overview' || activeTab === 'Analytics'),
  });

  const { data: cityData } = useQuery({
    queryKey: ['city-comparison', id],
    queryFn: () => getCityComparison(id!).then(r => r.data?.data || r.data || []),
    enabled: !!id && isAuthenticated && activeTab === 'City Comparison',
  });

  const { data: seasonalData } = useQuery({
    queryKey: ['seasonal', id],
    queryFn: () => getSeasonalPatterns(id!).then(r => r.data?.data || r.data || []),
    enabled: !!id && isAuthenticated && (activeTab === 'Seasonal' || activeTab === 'Overview'),
  });

  const { data: forecast } = useQuery({
    queryKey: ['forecast', id],
    queryFn: () => getForecast(id!).then(r => r.data?.data || r.data),
    enabled: !!id && isAuthenticated && activeTab === 'Analytics',
  });

  const { data: inflation } = useQuery({
    queryKey: ['inflation', id],
    queryFn: () => getInflationTrend(id!).then(r => r.data?.data || r.data),
    enabled: !!id && isAuthenticated && activeTab === 'Analytics',
  });

  // Derived: Volatility Calculation
  const calculateVolatility = () => {
    if (!trendData || trendData.length < 2) return null;
    const prices = trendData.map((d: any) => d.avgPrice);
    const mean = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
    const stdDev = Math.sqrt(prices.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / prices.length);
    const cv = (stdDev / mean) * 100; // Coefficient of Variation
    return { score: cv, label: cv < 5 ? 'Stable' : cv < 15 ? 'Moderate' : 'High' };
  };
  const volatility = calculateVolatility();

  // Derived: Best months
  const bestBuyingMonths = (seasonalData || [])
    .filter((d: any) => d.seasonalIndex < 0.95)
    .sort((a: any, b: any) => a.seasonalIndex - b.seasonalIndex)
    .map((d: any) => d.monthName);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground">
        <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
        <span className="mx-2">/</span>
        <Link to="/commodities" className="hover:text-primary transition-colors">Commodities</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium">{commodity?.name || '...'}</span>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-green-50">
            <CommodityIcon name={commodity?.name || ''} size="lg" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{commodity?.category}</span>
            </div>
            <h1 className="font-display text-4xl font-bold text-foreground">{commodity?.name}</h1>
            <p className="text-muted-foreground mt-1">Price intelligence for Ghana's major markets</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-50 text-right min-w-[200px]">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Current Average</p>
          <p className="font-mono text-4xl font-black text-primary leading-none">{formatPrice(priceRange?.avgPrice)}</p>
          <div className="mt-2 flex items-center justify-end">
            <PriceChangeTag value={priceRange?.percentChange} />
          </div>
        </div>
      </div>

      {!isAuthenticated && <GatePrompt message="Sign in for full price trends, city comparison, and analytics." />}

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-muted/30 rounded-xl w-fit overflow-x-auto border border-border">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {activeTab === 'Overview' && (
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Avg Price" value={formatPrice(priceRange?.avgPrice)} icon={DollarSign} loading={priceLoading} />
              <StatCard title="Min Price" value={formatPrice(priceRange?.minPrice)} icon={TrendingDown} loading={priceLoading} />
              <StatCard title="Max Price" value={formatPrice(priceRange?.maxPrice)} icon={TrendingUp} loading={priceLoading} />
              <StatCard title="Price Median" value={formatPrice(priceRange?.medianPrice)} icon={Activity} loading={priceLoading} />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="card-ghana p-8 lg:col-span-2">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-display text-xl font-bold flex items-center gap-2 text-foreground">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Market Price Range
                  </h3>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wide block mb-1">Spread</span>
                    <span className="font-mono font-bold text-lg text-foreground">{formatPrice((priceRange?.maxPrice || 0) - (priceRange?.minPrice || 0))}</span>
                  </div>
                </div>
                
                {/* Price Bar Indicator */}
                <div className="space-y-4">
                  <div className="relative h-12 w-full bg-muted/50 rounded-full overflow-hidden border border-border">
                    {/* Tick for Average */}
                    {priceRange?.maxPrice > 0 && (
                      <>
                        <div 
                          className="absolute h-full bg-primary/20 border-x border-primary/30"
                          style={{ 
                            left: `${((priceRange.minPrice / priceRange.maxPrice) * 100)}%`,
                            right: `${100 - ( ( (priceRange.maxPrice / priceRange.maxPrice) * 100 ) )}%` 
                          }}
                        />
                        <div 
                          className="absolute h-full top-0 w-1.5 bg-primary z-10 shadow-[0_0_10px_rgba(27,94,32,0.5)]"
                          style={{ left: `${((priceRange.avgPrice / priceRange.maxPrice) * 100)}%` }}
                        />
                      </>
                    )}
                  </div>
                  <div className="flex justify-between text-xs font-bold font-mono text-muted-foreground px-2">
                    <span>{formatPrice(priceRange?.minPrice)} (Min)</span>
                    <span className="text-primary">{formatPrice(priceRange?.avgPrice)} (Avg)</span>
                    <span>{formatPrice(priceRange?.maxPrice)} (Max)</span>
                  </div>
                </div>

                <div className="mt-10 pt-10 border-t border-border grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-2">Price Stability</p>
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${volatility?.score < 10 ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      <span className="text-lg font-bold text-foreground">{volatility?.label || 'Calculating...'}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-2">Current Trend</p>
                    <div className="flex items-center gap-2">
                      {(priceRange?.percentChange || 0) > 0 ? (
                        <TrendingUp className="h-5 w-5 text-destructive" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-primary" />
                      )}
                      <span className="text-lg font-bold text-foreground">{(priceRange?.percentChange || 0) > 0 ? 'Rising' : 'Cooling'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-ghana p-8 flex flex-col justify-between overflow-hidden relative">
                <div className="relative z-10">
                  <h3 className="font-display text-xl font-bold text-foreground mb-6">Quick Outlook</h3>
                  {seasonalData && seasonalData.length > 0 ? (
                    <div className="space-y-6">
                      <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Best Pricing In</p>
                        <p className="text-2xl font-black text-[#1B5E20]">{bestBuyingMonths[0] || 'Unknown'}</p>
                        <p className="text-xs text-[#1B5E20]/70 mt-1">Historically lowest prices this month</p>
                      </div>
                      <Link to="/seasonal" className="text-sm font-bold text-primary flex items-center gap-2 hover:gap-3 transition-all">
                        Full Seasonal Guide <Activity className="h-4 w-4" />
                      </Link>
                    </div>
                  ) : <div className="shimmer h-32 rounded-xl" />}
                </div>
                <div className="absolute -bottom-10 -right-10 text-primary/5 opacity-40 transform -rotate-12">
                   <Leaf size={200} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Price Trends' && (
          isAuthenticated ? (
            <div className="card-ghana p-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-display text-2xl font-bold text-foreground">Historical Price Trends</h3>
                  <p className="text-muted-foreground">Monthly average price movement over time</p>
                </div>
                <div className="flex items-center p-1 bg-muted/50 rounded-lg">
                  {[3, 6, 12].map(m => (
                    <button key={m} onClick={() => setMonths(m)}
                      className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${months === m ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                      {m}M
                    </button>
                  ))}
                </div>
              </div>
              <PriceTrendChart data={Array.isArray(trendData) ? trendData : []} height={450} />
            </div>
          ) : <GatePrompt />
        )}

        {activeTab === 'City Comparison' && (
          isAuthenticated ? (
            <div className="card-ghana p-10">
              <div className="mb-8">
                <h3 className="font-display text-2xl font-bold text-foreground text-center">Price Dispersion by City</h3>
                <p className="text-muted-foreground text-center">Red bars indicate high price zones, green bars indicate affordability</p>
              </div>
              <div className="max-w-4xl mx-auto">
                <CityComparisonChart data={Array.isArray(cityData) ? cityData : []} height={450} />
              </div>
            </div>
          ) : <GatePrompt />
        )}

        {activeTab === 'Seasonal' && (
          isAuthenticated ? (
            <div className="grid gap-6 lg:grid-cols-4">
              <div className="lg:col-span-3 card-ghana p-10">
                 <h3 className="font-display text-2xl font-bold text-foreground mb-8 text-center">12-Month Seasonal Patterns</h3>
                 <SeasonalChart data={Array.isArray(seasonalData) ? seasonalData : []} height={450} />
              </div>
              <div className="space-y-6">
                <div className="card-ghana p-8 h-full">
                  <h3 className="font-display text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-primary" />
                    Buying Window
                  </h3>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed italic">The following months historically show the best value for {commodity?.name}:</p>
                    <div className="flex flex-wrap gap-2">
                      {bestBuyingMonths.map(month => (
                        <span key={month} className="px-3 py-1.5 bg-green-50 text-primary border border-green-100 rounded-lg text-xs font-bold shadow-sm">{month}</span>
                      ))}
                    </div>
                    {bestBuyingMonths.length === 0 && <p className="text-xs font-bold text-muted-foreground">No specific cheap window found.</p>}
                  </div>
                </div>
              </div>
            </div>
          ) : <GatePrompt message="Sign in to view 12-month historical seasonal patterns." />
        )}

        {activeTab === 'Analytics' && (
          isAuthenticated ? (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="card-ghana p-8 flex flex-col items-center text-center justify-center">
                  <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-red-500" />
                  </div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Inflation</h3>
                  <p className="font-mono text-4xl font-black mb-1" style={{ color: (inflation?.percentageChange || 0) > 0 ? '#C62828' : '#1B5E20' }}>
                    {formatPercentage(inflation?.percentageChange)}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">Month-on-month change</p>
                </div>

                <div className="card-ghana p-8 flex flex-col items-center text-center justify-center">
                  <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                    <Activity className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Volatility Score</h3>
                  <p className="font-mono text-4xl font-black text-foreground mb-1">
                    {volatility ? volatility.score.toFixed(1) : '...'}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">Status: <span className="text-primary font-bold">{volatility?.label}</span></p>
                </div>

                <div className="card-ghana p-8 flex flex-col items-center text-center justify-center border-t-4 border-t-primary">
                  <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center mb-4">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Forecasted Price</h3>
                  <p className="font-mono text-4xl font-black text-primary mb-1">{formatPrice(forecast?.forecastPrice)}</p>
                  <p className="text-xs font-medium text-muted-foreground">Projected next month average</p>
                </div>
              </div>
              
              {trendData && trendData.length > 0 && (
                <div className="card-ghana p-10">
                  <h3 className="font-display text-xl font-bold text-foreground mb-6">Price Trajectory</h3>
                  <PriceTrendChart data={trendData} height={350} />
                </div>
              )}
            </div>
          ) : <GatePrompt />
        )}
      </div>
    </div>
  );
};

export default CommodityDetailPage;
