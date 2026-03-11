import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getSeasonalData } from '@/api/seasonal';
import { SeasonalChart } from '@/components/charts/SeasonalChart';
import { GatePrompt } from '@/components/shared/GatePrompt';
import { CommodityIcon } from '@/components/shared/CommodityIcon';
import { COMMODITIES } from '@/utils/constants';

const SeasonalPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [selectedIdx, setSelectedIdx] = useState(0);

  const { data: seasonalData } = useQuery({
    queryKey: ['seasonal', String(selectedIdx + 1)],
    queryFn: () => getSeasonalData(String(selectedIdx + 1)).then(r => r.data?.data || r.data || []),
    staleTime: 10 * 60_000,
  });

  const bestMonth = Array.isArray(seasonalData)
    ? seasonalData.reduce((min: any, curr: any) => (!min || curr.seasonalIndex < min.seasonalIndex ? curr : min), null)
    : null;

  const worstMonth = Array.isArray(seasonalData)
    ? seasonalData.reduce((max: any, curr: any) => (!max || curr.seasonalIndex > max.seasonalIndex ? curr : max), null)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-accent font-display text-2xl font-bold text-foreground">Seasonal Buying Guide</h1>
        <p className="mt-2 text-muted-foreground">Know the best and worst months to buy each commodity based on years of historical price patterns in Ghana.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {COMMODITIES.map((name, i) => (
          <button key={name} onClick={() => setSelectedIdx(i)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
              selectedIdx === i ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}>
            <CommodityIcon name={name} size="sm" /> {name}
          </button>
        ))}
      </div>

      <div className="card-ghana p-6">
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">{COMMODITIES[selectedIdx]} — 12-Month Seasonal Pattern</h2>
        {isAuthenticated ? (
          <SeasonalChart data={Array.isArray(seasonalData) ? seasonalData : []} />
        ) : (
          <>
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              Preview not available for guests
            </div>
            <GatePrompt message="See the full 12-month calendar — Sign in for complete seasonal insights." />
          </>
        )}
      </div>

      {isAuthenticated && bestMonth && worstMonth && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card-ghana kente-accent p-5">
            <p className="text-sm text-muted-foreground">Best month to buy {COMMODITIES[selectedIdx]}</p>
            <p className="mt-1 font-display text-xl font-bold text-primary">{bestMonth.month}</p>
            <p className="text-sm text-muted-foreground">Index {bestMonth.seasonalIndex?.toFixed(2)} — {((1 - bestMonth.seasonalIndex) * 100).toFixed(0)}% below average</p>
          </div>
          <div className="card-ghana p-5 border-l-[3px] border-l-destructive">
            <p className="text-sm text-muted-foreground">Worst month to buy {COMMODITIES[selectedIdx]}</p>
            <p className="mt-1 font-display text-xl font-bold text-destructive">{worstMonth.month}</p>
            <p className="text-sm text-muted-foreground">Index {worstMonth.seasonalIndex?.toFixed(2)} — {((worstMonth.seasonalIndex - 1) * 100).toFixed(0)}% above average</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeasonalPage;
