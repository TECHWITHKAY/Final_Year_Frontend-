import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { exportPriceRecords } from '@/api/exports';
import { getAllCommodities } from '@/api/commodities';
import { getAllCities } from '@/api/cities';
import { toast } from 'sonner';
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  Info, 
  Lightbulb, 
  ShieldCheck,
  History,
  Check,
  X
} from 'lucide-react';

const ExportPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [format, setFormat] = useState<'CSV' | 'EXCEL'>('CSV');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedCommodities, setSelectedCommodities] = useState<number[]>([]);
  const [selectedCities, setSelectedCities] = useState<number[]>([]);

  const { data: commodities } = useQuery({
    queryKey: ['commodities-all'],
    queryFn: () => getAllCommodities().then(r => r.data?.data || r.data || []),
    staleTime: 30 * 60_000,
  });

  const { data: cities } = useQuery({
    queryKey: ['cities-all'],
    queryFn: () => getAllCities().then(r => r.data?.data || r.data || []),
    staleTime: 30 * 60_000,
  });

  const commodityList = Array.isArray(commodities) ? commodities : [];
  const cityList = Array.isArray(cities) ? cities : [];

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const toggleItem = (id: number, list: number[], setter: (v: number[]) => void) => {
    if (list.includes(id)) {
      setter(list.filter(item => item !== id));
    } else {
      setter([...list, id]);
    }
  };

  const exportMutation = useMutation<any, Error, { format: 'CSV' | 'EXCEL'; dateFrom: string; dateTo: string }>({
    mutationFn: (vars) => exportPriceRecords({
      exportType: vars.format,
      fromDate: vars.dateFrom || undefined,
      toDate: vars.dateTo || undefined,
      commodityIds: selectedCommodities.length > 0 ? selectedCommodities : undefined,
      cityIds: selectedCities.length > 0 ? selectedCities : undefined,
    }),
    onSuccess: (res: any) => {
      const contentType = format === 'CSV' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const ext = format === 'CSV' ? 'csv' : 'xlsx';
      const blob = new Blob([res.data], { type: contentType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `commodity-prices-${new Date().toISOString().split('T')[0]}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export downloaded successfully');
    },
    onError: () => toast.error('Export failed. Please check your filters.'),
  });

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-12">
      <div className="relative">
        <h1 className="heading-accent font-display text-4xl font-black text-foreground tracking-tight">Export Data Hub</h1>
        <p className="mt-2 text-muted-foreground font-medium max-w-2xl">Precision export tools for researchers, policy makers, and market analysts. Filter, configure, and download raw datasets.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Main Export Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-ghana overflow-hidden shadow-xl border-t-4 border-t-[#1B5E20]">
            <div className="bg-slate-50 border-b border-border p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-black text-foreground">Configure Data Package</h2>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Select filters and file format</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-10">
              {/* Section 1: Date Range */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#1B5E20]">
                  <Calendar className="h-5 w-5" />
                  <h3 className="font-black text-sm uppercase tracking-wider">Step 1: Time Period</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase text-muted-foreground tracking-widest">Start Date</label>
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-foreground focus:border-primary focus:ring-0 transition-all" />
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase text-muted-foreground tracking-widest">End Date</label>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-foreground focus:border-primary focus:ring-0 transition-all" />
                  </div>
                </div>
              </div>

              {/* Section 2: Commodity Filter */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#1B5E20]">
                    <Filter className="h-5 w-5" />
                    <h3 className="font-black text-sm uppercase tracking-wider">Step 2: Commodities</h3>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setSelectedCommodities(commodityList.map((c: any) => c.id || c.commodityId))}
                      className="text-[10px] font-black text-primary uppercase hover:underline"
                    >
                      Select All
                    </button>
                    <button 
                      onClick={() => setSelectedCommodities([])}
                      className="text-[10px] font-black text-rose-600 uppercase hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {commodityList.map((c: any) => {
                    const id = c.id || c.commodityId;
                    const name = c.name || c.commodityName;
                    const isSelected = selectedCommodities.includes(id);
                    return (
                      <button
                        key={id}
                        onClick={() => toggleItem(id, selectedCommodities, setSelectedCommodities)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all border-2 ${
                          isSelected 
                            ? 'bg-[#1B5E20] border-[#1B5E20] text-white shadow-md' 
                            : 'bg-white border-slate-300 text-slate-400 hover:border-primary/50'
                        }`}
                      >
                        {isSelected ? <Check className="h-3 w-3" /> : null}
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: City Filter */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#1B5E20]">
                    <Filter className="h-5 w-5" />
                    <h3 className="font-black text-sm uppercase tracking-wider">Step 3: Geographic Scope</h3>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setSelectedCities(cityList.map((c: any) => c.id))}
                      className="text-[10px] font-black text-primary uppercase hover:underline"
                    >
                      Select All
                    </button>
                    <button 
                      onClick={() => setSelectedCities([])}
                      className="text-[10px] font-black text-rose-600 uppercase hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {cityList.map((c: any) => {
                    const id = c.id;
                    const isSelected = selectedCities.includes(id);
                    return (
                      <button
                        key={id}
                        onClick={() => toggleItem(id, selectedCities, setSelectedCities)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all border-2 ${
                          isSelected 
                            ? 'bg-[#1B5E20] border-[#1B5E20] text-white shadow-md' 
                            : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {isSelected ? <Check className="h-3 w-3" /> : null}
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 4: Format Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#1B5E20]">
                  <Download className="h-5 w-5" />
                  <h3 className="font-black text-sm uppercase tracking-wider">Step 4: Output Format</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { val: 'CSV' as const, icon: FileText, label: 'Text-Encoded CSV', desc: 'Best for Python, R, Stata' },
                    { val: 'EXCEL' as const, icon: FileSpreadsheet, label: 'Microsoft Excel', desc: 'Formatted for Pivot Tables' },
                  ].map(opt => (
                    <button 
                      key={opt.val} 
                      onClick={() => setFormat(opt.val)}
                      className={`flex flex-col items-start p-5 rounded-2xl border-2 transition-all text-left ${
                        format === opt.val 
                          ? 'bg-[#f0fdf4] border-[#1B5E20] ring-1 ring-[#1B5E20]' 
                          : 'bg-white border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className={`p-2 rounded-lg mb-3 ${format === opt.val ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <opt.icon className="h-6 w-6" />
                      </div>
                      <span className="text-sm font-black text-foreground">{opt.label}</span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-border mt-6">
              <button
                onClick={() => exportMutation.mutate({ format, dateFrom, dateTo })}
                disabled={exportMutation.isPending}
                className="w-full flex items-center justify-center gap-3 rounded-2xl bg-[#F9A825] py-5 text-sm font-black text-foreground hover:bg-[#ffb300] transition-all transform active:scale-[0.98] shadow-lg shadow-amber-200/50 disabled:opacity-50"
              >
                {exportMutation.isPending ? (
                  <>
                    <div className="h-5 w-5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                    PREPARING DATA PACKAGE...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    GENERATE EXPORT FILE
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar panels */}
        <div className="space-y-6">
          <div className="card-ghana p-6 bg-[#1B5E20] text-white border-none shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-amber-300" />
              <h3 className="font-display text-lg font-black">What's included</h3>
            </div>
            <ul className="space-y-4">
              {[
                { icon: '📦', text: 'Commodity name & category' },
                { icon: '🏪', text: 'Market & city' },
                { icon: '📅', text: 'Date of price recording' },
                { icon: '💰', text: 'Price in GHS' },
                { icon: '⚖️', text: 'Unit of measurement' },
                { icon: '👤', text: 'Verified by field agent' }
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs font-black text-white">
                  <span>{item.icon}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-ghana p-6 bg-white border-slate-100 shadow-md">
            <div className="flex items-center gap-2 mb-4 text-[#1B5E20]">
              <Lightbulb className="h-5 w-5" />
              <h3 className="font-display text-lg font-black">Usage Tips</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-black text-primary uppercase mb-1">Analysis Pro</p>
                <p className="text-xs font-bold text-muted-foreground leading-relaxed">Use Excel format if you intend to use Pivot Tables or standard Office charts.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-black text-primary uppercase mb-1">Developer Notice</p>
                <p className="text-xs font-bold text-muted-foreground leading-relaxed">CSV is the preferred format for ingestion into Python Pandas or R Studio.</p>
              </div>
            </div>
          </div>

          <div className="card-ghana p-6 bg-amber-50 border-amber-200/50 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-amber-700">
              <ShieldCheck className="h-5 w-5" />
              <h3 className="font-display text-lg font-black">Data Integrity</h3>
            </div>
            <p className="text-xs font-bold text-amber-800/70 leading-relaxed italic">
              All data is collected by verified field agents across Ghana and cross-checked for accuracy before publishing.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="mt-12 opacity-60 group transition-all">
         <div className="flex items-center gap-3 mb-6">
            <History className="h-6 w-6 text-foreground" />
            <h3 className="font-display text-2xl font-black text-foreground">Recent Exports</h3>
         </div>
         <div className="card-ghana border-dashed border-2 border-slate-200 bg-transparent py-16 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-300">
               <span className="text-3xl">📭</span>
            </div>
            <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">No export history yet</p>
            <p className="mt-1 text-xs font-bold text-slate-400">Your downloaded files will appear here once you download your first dataset.</p>
         </div>
      </div>
    </div>
  );
};

export default ExportPage;
