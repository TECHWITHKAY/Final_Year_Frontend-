import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getCommodities } from '@/api/commodities';
import { getMarkets } from '@/api/markets';
import { submitPriceRecord, getMySubmissions } from '@/api/priceRecords';
import { toast } from 'sonner';
import { formatPrice, formatDate } from '@/utils/formatters';

const SubmitPricePage: React.FC = () => {
  const { isAuthenticated, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ commodityId: '', marketId: '', price: '', recordedDate: new Date().toISOString().split('T')[0], source: '' });
  const [autoApprove, setAutoApprove] = useState(false);

  const { data: commodities } = useQuery({ queryKey: ['commodities'], queryFn: () => getCommodities().then(r => r.data?.data || r.data || []) });
  const { data: markets } = useQuery({ queryKey: ['markets'], queryFn: () => getMarkets().then(r => r.data?.data || r.data || []) });
  const { data: mySubmissions } = useQuery({ queryKey: ['my-submissions'], queryFn: () => getMySubmissions().then(r => r.data?.data || r.data || []) });

  const mutation = useMutation({
    mutationFn: () => submitPriceRecord({ ...form, price: parseFloat(form.price), autoApprove: hasRole('ADMIN') && autoApprove }),
    onSuccess: () => {
      toast.success(hasRole('ADMIN') && autoApprove ? 'Price record approved and live.' : 'Price submitted for admin review.');
      queryClient.invalidateQueries({ queryKey: ['my-submissions'] });
      setForm(prev => ({ ...prev, price: '', source: '' }));
    },
    onError: () => toast.error('Submission failed'),
  });

  if (!isAuthenticated || (!hasRole('FIELD_AGENT') && !hasRole('ADMIN'))) {
    return <Navigate to="/dashboard" replace />;
  }

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const statusColors: Record<string, string> = { PENDING: 'bg-accent text-accent-foreground', APPROVED: 'bg-secondary text-secondary-foreground', REJECTED: 'bg-destructive/10 text-destructive' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-accent font-display text-2xl font-bold text-foreground">Submit Price Record</h1>
        <p className="mt-2 text-muted-foreground">Enter today's market price observed in the field.</p>
      </div>

      <div className="card-ghana p-6 max-w-xl space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Commodity</label>
          <select value={form.commodityId} onChange={update('commodityId')}
            className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground">
            <option value="">Select commodity</option>
            {(commodities || []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Market</label>
          <select value={form.marketId} onChange={update('marketId')}
            className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground">
            <option value="">Select market</option>
            {(markets || []).map((m: any) => <option key={m.id} value={m.id}>{m.name} — {m.cityName || m.city}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Price (GHS)</label>
          <input type="number" step="0.01" value={form.price} onChange={update('price')}
            className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground" placeholder="0.00" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Recorded Date</label>
          <input type="date" value={form.recordedDate} onChange={update('recordedDate')} max={new Date().toISOString().split('T')[0]}
            className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Source (optional)</label>
          <input type="text" value={form.source} onChange={update('source')}
            className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground" placeholder="e.g. Field visit — Kejetia Market" />
        </div>
        {hasRole('ADMIN') && (
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={autoApprove} onChange={e => setAutoApprove(e.target.checked)}
              className="rounded border-input" />
            Approve immediately
          </label>
        )}
        <button onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.commodityId || !form.marketId || !form.price}
          className="w-full rounded-md bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 transition disabled:opacity-50">
          {mutation.isPending ? 'Submitting...' : 'Submit for Review'}
        </button>
      </div>

      {Array.isArray(mySubmissions) && mySubmissions.length > 0 && (
        <div className="card-ghana overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-display text-lg font-semibold text-foreground">My Recent Submissions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Commodity</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Market</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Price</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {mySubmissions.map((s: any, i: number) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-4 py-3 text-foreground">{s.commodityName || s.commodity}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.marketName || s.market}</td>
                    <td className="px-4 py-3 text-right font-mono text-primary">{formatPrice(s.price)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{formatDate(s.recordedDate)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[s.status] || ''}`}>{s.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmitPricePage;
