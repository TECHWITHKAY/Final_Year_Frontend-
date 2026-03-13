import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMarketById } from '@/api/markets';
import { getAllHealthScores } from '@/api/health';
import { getLatestPrices } from '@/api/public';
import { GradeTag } from '@/components/shared/GradeTag';
import { CommodityIcon } from '@/components/shared/CommodityIcon';
import { formatPrice, formatDate } from '@/utils/formatters';
import { Clock, Activity, CheckCircle, Store, MapPin } from 'lucide-react';

const MarketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: market } = useQuery({
    queryKey: ['market', id],
    queryFn: () => getMarketById(id!).then(r => r.data?.data || r.data),
    enabled: !!id,
  });

  const { data: healthScores } = useQuery({
    queryKey: ['health-scores'],
    queryFn: () => getAllHealthScores().then(r => r.data?.data || r.data || []),
  });

  const { data: prices } = useQuery({
    queryKey: ['market-prices', id],
    queryFn: () => getLatestPrices({ marketId: id }).then(r => r.data?.data || r.data || []),
    enabled: !!id,
  });

  const health = healthScores?.find((h: any) => String(h.marketId || h.id) === id);

  // Identify top 3 most expensive
  const sortedPrices = [...(prices || [])].sort((a, b) => (b.price || b.avgPrice) - (a.price || a.avgPrice));
  const top3Ids = sortedPrices.slice(0, 3).map(p => p.commodityId || p.commodity || p.commodityName);

  // Helper to get category emoji
  const getCategoryEmoji = (cName: string) => {
    const name = cName.toLowerCase();
    if (name.includes('maize') || name.includes('rice') || name.includes('millet') || name.includes('sorghum')) return '🌾';
    if (name.includes('tomato') || name.includes('onion') || name.includes('pepper') || name.includes('eggs')) return '🥬';
    if (name.includes('yam') || name.includes('cassava') || name.includes('plantain') || name.includes('potato')) return '🍠';
    if (name.includes('beans') || name.includes('cowpea') || name.includes('legumes')) return '🫘';
    if (name.includes('mango') || name.includes('pineapple') || name.includes('orange')) return '🍋';
    return '📦';
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <nav className="text-sm text-muted-foreground">
        <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
        <span className="mx-2">/</span>
        <Link to="/markets" className="hover:text-primary transition-colors">Markets</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium">{market?.name || '...'}</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-green-50 flex items-center justify-center">
            <Store className="h-10 w-10 text-[#1B5E20]" />
          </div>
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="font-display text-4xl font-black text-foreground leading-tight tracking-tight">{market?.name}</h1>
              {health && <GradeTag grade={health.grade} size="xl" variant="circle" className="shadow-lg border-2 border-white" />}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground font-semibold">
              <MapPin className="h-4 w-4 text-[#1B5E20]" />
              {market?.cityName || market?.city}
            </div>
          </div>
        </div>
        <div className="hidden md:block h-20 w-px bg-green-200/50 mx-4" />
        <div className="flex flex-col text-right">
          <span className="text-xs text-muted-foreground uppercase font-black tracking-widest mb-1.5">Overall Health</span>
          <span className="text-5xl font-black text-[#1B5E20] tabular-nums">{health?.healthScore || '...'}%</span>
        </div>
      </div>

      {health && (
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { label: 'Data Freshness', value: health.dataFreshness, icon: '🌿', color: 'bg-green-500' },
            { label: 'Price Stability', value: health.priceStability, icon: '📊', color: 'bg-amber-500' },
            { label: 'Market Coverage', value: health.coverage, icon: '🗺️', color: 'bg-green-500' },
          ].map(sub => (
            <div key={sub.label} className="card-ghana p-6 flex flex-col group hover:border-primary/20 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl" role="img">{sub.icon}</span>
                <span className="text-xs font-black text-muted-foreground uppercase tracking-wider">{sub.label}</span>
              </div>
              
              <div className="mb-4">
                {sub.label === 'Price Stability' && sub.value === 0 ? (
                  <p className="font-mono text-2xl font-black text-slate-400">Insufficient Data</p>
                ) : (
                  <p className="font-mono text-3xl font-black text-foreground">{sub.value || 0}%</p>
                )}
              </div>

              <div className="mt-auto h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${sub.value === 0 && sub.label === 'Price Stability' ? 'bg-slate-300' : sub.color}`} 
                  style={{ width: `${sub.value || 0}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card-ghana overflow-hidden shadow-xl border-t-4 border-t-[#1B5E20]">
        <div className="p-6 border-b border-border bg-white flex items-center justify-between">
          <h2 className="font-display text-2xl font-black text-foreground flex items-center gap-3">
            <span className="w-2 h-8 bg-[#1B5E20] rounded-full" />
            Market Price List
          </h2>
          <span className="text-xs font-black text-muted-foreground uppercase tracking-widest bg-muted px-4 py-1.5 rounded-full border border-border shadow-inner">
            {prices?.length || 0} ITEMS TRACKED
          </span>
        </div>
        <div className="overflow-x-auto text-[15px]">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1B5E20] text-white">
                <th className="px-6 py-4 text-left font-black uppercase text-[11px] tracking-widest">Commodity Name</th>
                <th className="px-6 py-4 text-left font-black uppercase text-[11px] tracking-widest">Trade Unit</th>
                <th className="px-6 py-4 text-right font-black uppercase text-[11px] tracking-widest">Avg Price (GHS)</th>
                <th className="px-6 py-4 text-right font-black uppercase text-[11px] tracking-widest">Update Date</th>
              </tr>
            </thead>
            <tbody>
              {(prices || []).map((p: any, i: number) => {
                const isExpensive = top3Ids.includes(p.commodityId || p.commodity || p.commodityName);
                const emoji = getCategoryEmoji(p.commodity || p.commodityName);
                return (
                  <tr key={i} className={`
                    border-b border-border transition-all hover:bg-[#e8f3e8] even:bg-[#f0f7f0]
                    ${isExpensive ? 'border-l-[3px] border-l-[#F59E0B]' : 'border-l-[3px] border-l-transparent'}
                  `}>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <span className="text-xl w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-border/50" role="img">
                          {emoji}
                        </span>
                        <span className="font-black text-foreground tracking-tight">{p.commodity || p.commodityName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-bold text-muted-foreground/80">{p.unit || 'kg'}</td>
                    <td className="px-6 py-5 text-right">
                      <span className={`font-mono text-xl font-black ${isExpensive ? 'text-[#F59E0B]' : 'text-[#1B5E20]'}`}>
                        {formatPrice(p.price || p.avgPrice)}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right text-sm font-bold text-muted-foreground/70 tabular-nums italic">
                      {formatDate(p.recordedDate || p.date)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MarketDetailPage;

