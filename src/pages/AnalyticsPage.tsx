import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getPriceVolatility, getInflationTrend, getForecast, getDataQualityReport } from '@/api/analytics';
import { VolatilityChart } from '@/components/charts/VolatilityChart';
import { formatPrice, formatPercentage } from '@/utils/formatters';
import { getAllCommodities } from '@/api/commodities';
import { PriceChangeTag } from '@/components/shared/PriceChangeTag';
import { Leaf, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const getCategoryEmoji = (cName: string) => {
  const name = cName.toLowerCase();
  if (name.includes('maize') || name.includes('rice') || name.includes('millet') || name.includes('sorghum')) return '🌾';
  if (name.includes('tomato') || name.includes('onion') || name.includes('pepper') || name.includes('eggs')) return '🥬';
  if (name.includes('yam') || name.includes('cassava') || name.includes('plantain') || name.includes('potato')) return '🍠';
  if (name.includes('beans') || name.includes('cowpea') || name.includes('legumes')) return '🫘';
  if (name.includes('mango') || name.includes('pineapple') || name.includes('orange')) return '🍋';
  return '📦';
};

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
        <h2 className="font-display text-xl font-black text-foreground mb-6 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Inflation Monitor
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {commodityList.map((c: any, i) => {
            const name = c.name || c.commodityName;
            const data = inflationResults?.[i];
            const change = data?.percentageChange || 0;
            const emoji = getCategoryEmoji(name);
            
            let bgClass = "bg-slate-50";
            let borderClass = "border-l-slate-300";
            let textClass = "text-slate-500";
            let label = "No Change";

            if (change > 0) {
              bgClass = "bg-[#f0fdf4]";
              borderClass = "border-l-emerald-500";
              textClass = "text-emerald-700";
              label = "Increase";
            } else if (change < 0) {
              bgClass = "bg-[#fef2f2]";
              borderClass = "border-l-rose-500";
              textClass = "text-rose-700";
              label = "Decrease";
            }

            return (
              <div key={name} className={`card-ghana p-6 border-l-4 ${borderClass} ${bgClass} transition-transform hover:scale-[1.02]`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl bg-white p-2 rounded-xl shadow-sm border border-border/50">{emoji}</span>
                    <p className="font-black text-foreground tracking-tight">{name}</p>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-white shadow-sm border border-border/20 ${textClass}`}>
                    {label}
                  </span>
                </div>
                <div className="flex flex-col">
                  <p className={`font-mono text-4xl font-black ${textClass} tabular-nums`}>
                    {change === 0 ? '0.0%' : formatPercentage(change)}
                  </p>
                  <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mt-1">Monthly Inflation Rate</p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/10 flex justify-between text-xs font-bold text-muted-foreground">
                  <div>
                    <span className="block opacity-60 text-[10px] uppercase tracking-tighter">Curr Avg</span>
                    <span className="text-foreground">{formatPrice(data?.currentMonthAvg)}</span>
                  </div>
                  <div className="text-right">
                    <span className="block opacity-60 text-[10px] uppercase tracking-tighter">Prev Avg</span>
                    <span className="text-foreground">{formatPrice(data?.lastMonthAvg)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card-ghana overflow-hidden shadow-xl border-t-4 border-t-primary">
        <div className="p-6 border-b border-border bg-white flex items-center justify-between">
          <h2 className="font-display text-xl font-black text-foreground flex items-center gap-3">
            <span className="w-2 h-8 bg-primary rounded-full" />
            Moving Average Forecasts
          </h2>
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted px-4 py-1.5 rounded-full border border-border shadow-inner">
            Next Period Projections
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1B5E20] text-white">
                <th className="px-6 py-4 text-left font-black uppercase text-[11px] tracking-widest">Commodity</th>
                <th className="px-6 py-4 text-right font-black uppercase text-[11px] tracking-widest">3-Month Avg</th>
                <th className="px-6 py-4 text-right font-black uppercase text-[11px] tracking-widest">Forecast Price</th>
                <th className="px-6 py-4 text-right font-black uppercase text-[11px] tracking-widest">Trend Signal</th>
              </tr>
            </thead>
            <tbody>
              {commodityList.map((c: any, i) => {
                const name = c.name || c.commodityName;
                const data = forecastResults?.[i];
                const inflData = inflationResults?.[i];
                const currentAvg = inflData?.currentMonthAvg || 0;
                const forecast = data?.forecastPrice || 0;
                const emoji = getCategoryEmoji(name);
                
                let trendIcon = <Minus className="h-4 w-4 text-slate-400" />;
                let trendLabel = "Stable";
                let trendColor = "text-slate-400";

                if (forecast > currentAvg && currentAvg > 0) {
                  trendIcon = <TrendingUp className="h-4 w-4 text-rose-500" />;
                  trendLabel = "Upward";
                  trendColor = "text-rose-500";
                } else if (forecast < currentAvg && currentAvg > 0) {
                  trendIcon = <TrendingDown className="h-4 w-4 text-emerald-500" />;
                  trendLabel = "Downward";
                  trendColor = "text-emerald-500";
                }

                return (
                  <tr key={name} className="border-b border-border transition-colors hover:bg-slate-50 even:bg-[#f0f7f0]/20">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <span className="text-xl w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-border/50" role="img">
                          {emoji}
                        </span>
                        <span className="font-black text-foreground tracking-tight">{name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right font-mono font-bold text-muted-foreground">{formatPrice(forecast)}</td>
                    <td className="px-6 py-5 text-right font-mono font-black text-[#1B5E20] bg-green-50/30">{formatPrice(forecast)}</td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-wider ${trendColor}`}>{trendLabel}</span>
                        <div className={`p-1.5 rounded-full bg-white border border-border/50 shadow-sm`}>
                          {trendIcon}
                        </div>
                      </div>
                    </td>
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
