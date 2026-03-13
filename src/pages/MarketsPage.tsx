import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { getAllHealthScores } from '@/api/health';
import { GradeTag } from '@/components/shared/GradeTag';
import { GatePrompt } from '@/components/shared/GatePrompt';
import { CITIES, GRADE_COLORS } from '@/utils/constants';
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

      <div className="flex flex-wrap gap-2 items-center">
        <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}
          className="rounded-lg border border-input bg-card px-4 py-2 text-sm text-foreground shadow-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none">
          <option value="All">All Cities</option>
          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="flex gap-2 p-1 bg-muted/30 rounded-full border border-border/50">
          {grades.map(g => (
            <button key={g} onClick={() => setGradeFilter(g)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all shadow-sm ${
                gradeFilter === g 
                  ? 'text-white' 
                  : 'bg-transparent text-muted-foreground hover:bg-white hover:text-foreground'
              }`}
              style={gradeFilter === g ? { backgroundColor: GRADE_COLORS[g] || '#1B5E20' } : {}}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="card-ghana p-8"><div className="shimmer h-40 rounded" /></div>)
          : filtered.map((market: any, i: number) => {
              const gradeColor = GRADE_COLORS[market.grade] || '#666';
              // Determine border color group
              const borderColor = ['A', 'B'].includes(market.grade) ? '#43A047' : 
                                 market.grade === 'C' ? '#FB8C00' : '#E53935';

              return (
              <motion.div key={market.marketId || i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} 
                className="card-ghana p-8 hover:-translate-y-1.5 transition-all duration-300 border-l-4"
                style={{ borderLeftColor: borderColor }}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-xl font-extrabold text-foreground">{market.marketName || market.market}</h3>
                    <p className="text-sm font-medium text-muted-foreground mt-1">{market.cityName || market.city}</p>
                  </div>
                  <GradeTag grade={market.grade} size="md" />
                </div>

                {isAuthenticated ? (
                  <div className="mt-8 space-y-4">
                    {[
                      { label: 'Data Freshness', value: market.dataFreshness },
                      { label: 'Price Stability', value: market.priceStability },
                      { label: 'Coverage', value: market.coverage },
                    ].map(sub => (
                      <div key={sub.label}>
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 px-0.5">
                          <span>{sub.label}</span>
                          <span>{sub.value && sub.value > 0 ? `${sub.value}%` : 'N/A'}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                          {sub.value && sub.value > 0 ? (
                            <div className="h-full rounded-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(27,94,32,0.3)]" 
                                 style={{ width: `${sub.value}%` }} />
                          ) : (
                            <div className="h-full w-full bg-slate-200 opacity-50" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-8 p-4 bg-muted/30 rounded-xl border border-dashed border-border flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="p-1.5 bg-white rounded-lg shadow-sm">
                      <Lock className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span>Health metrics locked. Sign in to view sub-scores.</span>
                  </div>
                )}
                
                <div className="mt-8 pt-6 border-t border-border/50">
                  <Link to={`/markets/${market.marketId || market.id}`}
                    className="group flex items-center justify-between text-sm font-bold text-primary">
                    View Insights
                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              </motion.div>
            )})}
      </div>

      {!isAuthenticated && <GatePrompt />}
    </div>
  );
};

export default MarketsPage;
