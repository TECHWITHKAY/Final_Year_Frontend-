import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getPriceVolatility, getInflationTrend, getForecast, getDataQualityReport } from '@/api/analytics';
import { VolatilityChart } from '@/components/charts/VolatilityChart';
import { formatPrice, formatPercentage } from '@/utils/formatters';
import { getAllCommodities } from '@/api/commodities';
import { PriceChangeTag } from '@/components/shared/PriceChangeTag';

const AnalyticsPage: React.FC = () => {
  const { isAuthenticated, hasRole } = useAuth();

  const { data: volatilityData } = useQuery({
    queryKey: ['volatility'],
    queryFn: () => getPriceVolatility().then(r => r.data?.data || r.data || []),
    enabled: isAuthenticated,
  });

  const { data: commodities } = useQuery({
    queryKey: ['commodities-list'],
    queryFn: () => getAllCommodities().then(r => r.data?.data || r.data || []),
    staleTime: 30 * 60_000,
  });
  
  const commodityList = Array.isArray(commodities) ? commodities : [];

  const { data: inflationResults } = useQuery({
    queryKey: ['inflation-all', commodityList.length],
    queryFn: async () => {
      if (!commodityList.length) return [];
      const results = await Promise.all(
        commodityList.map((c: any) => getInflationTrend(String(c.id || c.commodityId)).then(r => r.data?.data || r.data).catch(() => null))
      );
      return results;
    },
    enabled: isAuthenticated && commodityList.length > 0,
  });

  const { data: forecastResults } = useQuery({
    queryKey: ['forecast-all', commodityList.length],
    queryFn: async () => {
      if (!commodityList.length) return [];
      const results = await Promise.all(
        commodityList.map((c: any) => getForecast(String(c.id || c.commodityId)).then(r => r.data?.data || r.data).catch(() => null))
      );
      return results;
    },
    enabled: isAuthenticated && commodityList.length > 0,
  });

  const { data: dataQuality } = useQuery({
    queryKey: ['data-quality'],
    queryFn: () => getDataQualityReport().then(r => r.data?.data || r.data),
    enabled: isAuthenticated && (hasRole('ADMIN') || hasRole('ANALYST')),
  });

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="space-y-8">
      <h1 className="heading-accent font-display text-2xl font-bold text-foreground">Price Analytics</h1>

      <section className="card-ghana p-6">
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">Price Volatility Ranking</h2>
        <VolatilityChart data={Array.isArray(volatilityData) ? volatilityData : []} />
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">Inflation Monitor</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {commodityList.map((c: any, i) => {
            const name = c.name || c.commodityName;
            const data = inflationResults?.[i];
            return (
              <div key={name} className="card-ghana p-5">
                <p className="font-semibold text-foreground">{name}</p>
                <div className="mt-2 flex items-end justify-between">
                  <p className="font-mono text-xl font-bold" style={{ color: (data?.percentageChange || 0) > 0 ? '#C62828' : '#1B5E20' }}>
                    {formatPercentage(data?.percentageChange)}
                  </p>
                  <PriceChangeTag value={data?.percentageChange} />
                </div>
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>This month: {formatPrice(data?.currentMonthAvg)}</span>
                  <span>Last: {formatPrice(data?.lastMonthAvg)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card-ghana overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-display text-lg font-semibold text-foreground">Moving Average Forecasts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Commodity</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">3-Month Avg</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Forecast</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Trend</th>
              </tr>
            </thead>
            <tbody>
              {commodityList.map((c: any, i) => {
                const name = c.name || c.commodityName;
                const data = forecastResults?.[i];
                return (
                  <tr key={name} className="border-b border-border">
                    <td className="px-4 py-3 font-medium text-foreground">{name}</td>
                    <td className="px-4 py-3 text-right font-mono text-foreground">{formatPrice(data?.forecastPrice)}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-primary">{formatPrice(data?.forecastPrice)}</td>
                    <td className="px-4 py-3 text-right">{data?.forecastMonth || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {(hasRole('ADMIN') || hasRole('ANALYST')) && dataQuality && (
        <section className="card-ghana p-6">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">Data Quality Report</h2>
          <div className="text-center">
            <p className="font-mono text-4xl font-bold text-primary">{dataQuality.overallCompleteness?.toFixed(1) || 0}%</p>
            <p className="text-sm text-muted-foreground">Overall Data Completeness</p>
          </div>
        </section>
      )}
    </div>
  );
};

export default AnalyticsPage;
