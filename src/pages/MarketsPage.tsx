import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { getAllHealthScores } from '@/api/health';
import { GradeTag } from '@/components/shared/GradeTag';
import { GatePrompt } from '@/components/shared/GatePrompt';
import { CITIES } from '@/utils/constants';
import { Lock } from 'lucide-react';

const grades = ['All', 'A', 'B', 'C', 'D', 'F'];

const MarketsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [cityFilter, setCityFilter] = useState('All');
  const [gradeFilter, setGradeFilter] = useState('All');

  const { data: healthData, isLoading } = useQuery({
    queryKey: ['health-scores'],
    queryFn: () => getAllHealthScores().then(r => r.data?.data || r.data || []),
    staleTime: 10 * 60_000,
  });

  const filtered = (healthData || []).filter((m: any) => {
    if (cityFilter !== 'All' && (m.cityName || m.city) !== cityFilter) return false;
    if (gradeFilter !== 'All' && m.grade !== gradeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-accent font-display text-2xl font-bold text-foreground">Market Intelligence</h1>
        <p className="mt-2 text-muted-foreground">Explore market health scores and pricing data across Ghana.</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}
          className="rounded-md border border-input bg-card px-3 py-1.5 text-sm text-foreground">
          <option value="All">All Cities</option>
          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="flex gap-1">
          {grades.map(g => (
            <button key={g} onClick={() => setGradeFilter(g)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                gradeFilter === g ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground'
              }`}>{g}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="card-ghana p-6"><div className="shimmer h-32 rounded" /></div>)
          : filtered.map((market: any, i: number) => (
            <motion.div key={market.marketId || i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} className="card-ghana p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">{market.marketName || market.market}</h3>
                  <p className="text-sm text-muted-foreground">{market.cityName || market.city}</p>
                </div>
                <GradeTag grade={market.grade} />
              </div>
              {isAuthenticated ? (
                <div className="mt-4 space-y-2">
                  {[
                    { label: 'Data Freshness', value: market.dataFreshness },
                    { label: 'Price Stability', value: market.priceStability },
                    { label: 'Coverage', value: market.coverage },
                  ].map(sub => (
                    <div key={sub.label}>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{sub.label}</span><span>{sub.value || 0}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${sub.value || 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" /> Sub-scores require sign-in
                </div>
              )}
              <Link to={`/markets/${market.marketId || market.id}`}
                className="mt-4 inline-block text-sm font-medium text-primary hover:underline">View Market →</Link>
            </motion.div>
          ))}
      </div>

      {!isAuthenticated && <GatePrompt />}
    </div>
  );
};

export default MarketsPage;
