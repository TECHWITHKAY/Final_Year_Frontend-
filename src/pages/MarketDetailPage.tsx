import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMarket } from '@/api/markets';
import { getHealthScores } from '@/api/health';
import { getLatestPrices } from '@/api/priceRecords';
import { GradeTag } from '@/components/shared/GradeTag';
import { formatPrice, formatDate } from '@/utils/formatters';

const MarketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: market } = useQuery({
    queryKey: ['market', id],
    queryFn: () => getMarket(id!).then(r => r.data?.data || r.data),
    enabled: !!id,
  });

  const { data: healthScores } = useQuery({
    queryKey: ['health-scores'],
    queryFn: () => getHealthScores().then(r => r.data?.data || r.data || []),
  });

  const { data: prices } = useQuery({
    queryKey: ['market-prices', id],
    queryFn: () => getLatestPrices({ marketId: id }).then(r => r.data?.data || r.data || []),
    enabled: !!id,
  });

  const health = healthScores?.find((h: any) => String(h.marketId || h.id) === id);

  return (
    <div className="space-y-6">
      <nav className="text-sm text-muted-foreground">
        <Link to="/dashboard" className="hover:text-primary">Dashboard</Link>
        <span className="mx-2">/</span>
        <Link to="/markets" className="hover:text-primary">Markets</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium">{market?.name || '...'}</span>
      </nav>

      <div className="flex items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{market?.name}</h1>
          <p className="text-muted-foreground">{market?.cityName || market?.city}</p>
        </div>
        {health && <GradeTag grade={health.grade} size="lg" />}
      </div>

      {health && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Data Freshness', value: health.dataFreshness },
            { label: 'Price Stability', value: health.priceStability },
            { label: 'Coverage', value: health.coverage },
          ].map(sub => (
            <div key={sub.label} className="card-ghana p-5 text-center">
              <p className="font-mono text-3xl font-bold text-primary">{sub.value || 0}%</p>
              <p className="mt-1 text-sm text-muted-foreground">{sub.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card-ghana overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-display text-lg font-semibold text-foreground">Latest Prices</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Commodity</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Unit</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Price (GHS)</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {(prices || []).map((p: any, i: number) => (
                <tr key={i} className="border-b border-border hover:bg-muted/30 transition">
                  <td className="px-4 py-3 font-medium text-foreground">{p.commodity || p.commodityName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.unit || 'kg'}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-primary">{formatPrice(p.price || p.avgPrice)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{formatDate(p.recordedDate || p.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MarketDetailPage;
