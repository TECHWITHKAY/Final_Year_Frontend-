import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { exportPriceRecords } from '@/api/exports';
import { toast } from 'sonner';
import { FileSpreadsheet, FileText } from 'lucide-react';

const ExportPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [format, setFormat] = useState<'CSV' | 'EXCEL'>('CSV');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const exportMutation = useMutation<any, Error, { format: 'CSV' | 'EXCEL'; dateFrom: string; dateTo: string }>({
    mutationFn: (vars) => exportPriceRecords({
      exportType: vars.format,
      fromDate: vars.dateFrom || undefined,
      toDate: vars.dateTo || undefined,
    }),
    onSuccess: (res: any) => {
      const contentType = format === 'CSV' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const ext = format === 'CSV' ? 'csv' : 'xlsx';
      const blob = new Blob([res.data], { type: contentType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `commodity-prices.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export downloaded successfully');
    },
    onError: () => toast.error('Export failed'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-accent font-display text-2xl font-bold text-foreground">Export Data</h1>
        <p className="mt-2 text-muted-foreground">Download commodity price data for research, analysis, or reporting.</p>
      </div>

      <div className="card-ghana p-6 max-w-xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">From Date</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">To Date</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Format</label>
            <div className="flex gap-3">
              {[
                { val: 'CSV' as const, icon: FileText, label: 'CSV' },
                { val: 'EXCEL' as const, icon: FileSpreadsheet, label: 'Excel' },
              ].map(opt => (
                <button key={opt.val} onClick={() => setFormat(opt.val)}
                  className={`flex items-center gap-2 rounded-md border px-6 py-3 text-sm font-medium transition ${
                    format === opt.val ? 'border-primary bg-secondary text-primary' : 'border-border text-muted-foreground hover:border-primary'
                  }`}>
                  <opt.icon className="h-5 w-5" /> {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => exportMutation.mutate({ format, dateFrom, dateTo })}
            disabled={exportMutation.isPending}
            className="w-full rounded-md bg-accent py-2.5 text-sm font-bold text-accent-foreground hover:opacity-90 transition disabled:opacity-50"
          >
            {exportMutation.isPending ? 'Preparing your export...' : 'Download File'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportPage;
