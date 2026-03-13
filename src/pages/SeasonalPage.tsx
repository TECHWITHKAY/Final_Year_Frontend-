import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getSeasonalPatterns } from '@/api/seasonal';
import { SeasonalChart } from '@/components/charts/SeasonalChart';
import { GatePrompt } from '@/components/shared/GatePrompt';
import { CommodityIcon } from '@/components/shared/CommodityIcon';
import { getAllCommodities } from '@/api/commodities';
import { CheckCircle2, AlertTriangle, Lightbulb, Calendar, Info, ChevronLeft, ChevronRight } from 'lucide-react';

const SeasonalPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [selectedIdx, setSelectedIdx] = useState(0);

  const { data: commodities } = useQuery({
    queryKey: ['commodities-list'],
    queryFn: () => getAllCommodities().then(r => r.data?.data || r.data || []),
    staleTime: 30 * 60_000,
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      checkScroll();
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [checkScroll, commodities]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const commodityList = Array.isArray(commodities) ? commodities : [];
  const selectedCommodity = commodityList[selectedIdx];
  const selectedId = selectedCommodity ? String(selectedCommodity.id || selectedCommodity.commodityId) : null;
  const selectedName = selectedCommodity ? (selectedCommodity.name || selectedCommodity.commodityName) : '';

  const { data: seasonalData } = useQuery({
    queryKey: ['seasonal', selectedId],
    queryFn: () => getSeasonalPatterns(selectedId as string).then(r => r.data?.data || r.data || []),
    enabled: !!selectedId,
    staleTime: 10 * 60_000,
  });

  const bestMonth = Array.isArray(seasonalData)
    ? seasonalData.reduce((min: any, curr: any) => (!min || curr.seasonalIndex < min.seasonalIndex ? curr : min), null)
    : null;

  const worstMonth = Array.isArray(seasonalData)
    ? seasonalData.reduce((max: any, curr: any) => (!max || curr.seasonalIndex > max.seasonalIndex ? curr : max), null)
    : null;

  // Buying Calendar Logic
  const getMonthColor = (index: number) => {
    if (index < 0.85) return 'bg-emerald-500';
    if (index > 1.15) return 'bg-rose-500';
    return 'bg-amber-400';
  };

  const getMonthLabel = (index: number) => {
    if (index < 0.85) return 'Value';
    if (index > 1.15) return 'Expensive';
    return 'Average';
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      <div className="relative">
        <h1 className="heading-accent font-display text-3xl font-black text-foreground tracking-tight">Seasonal Buying Guide</h1>
        <p className="mt-2 text-muted-foreground font-medium max-w-2xl">Use historical price patterns to identify the best times to buy and save. Data based on 5-year averages in Ghana.</p>
      </div>

      {/* Horizontally Scrollable Commodity Pills with Smart Arrows */}
      <div className="relative group">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 h-10 w-10 bg-[#1B5E20] text-white rounded-full shadow-lg items-center justify-center hidden md:flex hover:bg-[#2E7D32] transition-all transform hover:scale-110 active:scale-95 border-2 border-white"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 h-10 w-10 bg-[#1B5E20] text-white rounded-full shadow-lg items-center justify-center hidden md:flex hover:bg-[#2E7D32] transition-all transform hover:scale-110 active:scale-95 border-2 border-white"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        <div 
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-4 no-scrollbar scroll-smooth mask-fade-right"
        >
          {commodityList.map((c: any, i) => {
            const name = c.name || c.commodityName;
            const isActive = selectedIdx === i;
            return (
              <button 
                key={name} 
                onClick={() => setSelectedIdx(i)}
                className={`flex-shrink-0 inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-black transition-all border-2 ${
                  isActive 
                    ? 'bg-[#1B5E20] border-[#1B5E20] text-white shadow-md transform scale-105' 
                    : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                }`}
              >
                <div className={`${isActive ? 'opacity-100' : 'opacity-60 grayscale'}`}>
                  <CommodityIcon name={name} size="sm" />
                </div>
                {name}
              </button>
            )})}
        </div>
      </div>

      <div className="card-ghana p-8 shadow-xl border-t-4 border-t-[#1B5E20]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl font-black text-foreground flex items-center gap-3">
             <Calendar className="h-6 w-6 text-primary" />
             {selectedName} Seasonality
          </h2>
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted px-4 py-1.5 rounded-full border border-border">
            12-MONTH PRICE INDEX
          </span>
        </div>
        {isAuthenticated ? (
          <div className="min-h-[400px]">
            <SeasonalChart data={Array.isArray(seasonalData) ? seasonalData : []} />
          </div>
        ) : (
          <div className="py-12">
            <div className="h-48 flex items-center justify-center text-muted-foreground bg-slate-50 rounded-2xl mb-6 border-2 border-dashed border-slate-200">
              <span className="font-bold flex items-center gap-2 font-display">
                <Info className="h-5 w-5" />
                Visual patterns hidden for guests
              </span>
            </div>
            <GatePrompt message="See the full 12-month calendar — Sign in for complete seasonal insights." />
          </div>
        )}
      </div>

      {isAuthenticated && bestMonth && worstMonth && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Best Month Card */}
            <div className="card-ghana p-8 border-l-8 border-l-emerald-500 bg-[#f0fdf4] transition-transform hover:scale-[1.02] flex flex-col justify-between min-h-[220px]">
              <div className="flex items-center justify-between mb-4">
                 <div className="h-14 w-14 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-emerald-100">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest bg-white/60 px-3 py-1 rounded text-emerald-700">OPTIMAL BUYING</span>
              </div>
              <div>
                <p className="text-sm font-black text-emerald-800/60 uppercase tracking-tighter">Best month to buy</p>
                <p className="mt-1 font-display text-5xl font-black text-emerald-900 tracking-tight">{bestMonth.month}</p>
                <div className="mt-3 flex items-center gap-2">
                   <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                   <p className="text-[13px] font-black text-emerald-700"> 
                    {((1 - bestMonth.seasonalIndex) * 100).toFixed(0)}% BELOW AVERAGE PRICE — GREAT TIME TO STOCK UP
                  </p>
                </div>
              </div>
            </div>

            {/* Worst Month Card */}
            <div className="card-ghana p-8 border-l-8 border-l-rose-500 bg-[#fff5f5] transition-transform hover:scale-[1.02] flex flex-col justify-between min-h-[220px]">
              <div className="flex items-center justify-between mb-4">
                 <div className="h-14 w-14 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-rose-100">
                    <AlertTriangle className="h-8 w-8 text-rose-600" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest bg-white/60 px-3 py-1 rounded text-rose-700">PRICING ALERT</span>
              </div>
              <div>
                <p className="text-sm font-black text-rose-800/60 uppercase tracking-tighter">Worst month to buy</p>
                <p className="mt-1 font-display text-5xl font-black text-rose-900 tracking-tight">{worstMonth.month}</p>
                <div className="mt-3 flex items-center gap-2">
                   <div className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                   <p className="text-[13px] font-black text-rose-700 uppercase">
                    {((worstMonth.seasonalIndex - 1) * 100).toFixed(0)}% ABOVE AVERAGE — CONSIDER BUYING IN ADVANCE
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Buying Calendar Strip */}
          <div className="card-ghana p-6 bg-white overflow-hidden shadow-md">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">A-Z Monthly Value Map</h3>
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
              {(seasonalData || []).map((m: any) => (
                <div key={m.month || Math.random()} className="flex flex-col items-center gap-2">
                   <div className={`w-full h-1.5 rounded-full ${getMonthColor(m.seasonalIndex)}`} />
                   <span className="text-[10px] font-black text-foreground uppercase">{(m.month || '???').substring(0, 3)}</span>
                   <span className="text-[9px] font-bold text-muted-foreground/50 uppercase leading-none">{getMonthLabel(m.seasonalIndex)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pro Tip Box */}
      <div className="bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 transition-transform group-hover:scale-110">
            <Lightbulb className="h-24 w-24" />
         </div>
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/20">
               <Lightbulb className="h-8 w-8 text-amber-200" />
            </div>
            <div>
               <h4 className="font-display text-2xl font-black mb-2 tracking-tight">Pro Tip: Seasonal Savings Strategy</h4>
               <p className="text-white/80 font-bold leading-relaxed max-w-3xl">
                  Prices typically drop <span className="text-amber-200">2–4 weeks after harvest season</span>. 
                  Consider buying in bulk during the <span className="bg-white/10 px-2 py-0.5 rounded">Green months</span> listed above 
                  to save up to <span className="text-white text-xl font-black underline decoration-amber-300">40% on your total grocery bill</span>.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default SeasonalPage;
