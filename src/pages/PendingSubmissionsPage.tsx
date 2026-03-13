import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getPendingRecords, approvePriceRecord } from '@/api/priceRecords';
import { toast } from 'sonner';
import { formatPrice, formatDate } from '@/utils/formatters';
import { Check, X } from 'lucide-react';

const PendingSubmissionsPage: React.FC = () => {
  const { isAuthenticated, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const { data: pending, isLoading } = useQuery({
    queryKey: ['pending-submissions'],
    queryFn: () => getPendingRecords().then(r => r.data?.data || r.data || []),
    enabled: isAuthenticated && hasRole('ADMIN'),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => approvePriceRecord(id, { priceRecordId: id, approved: true }),
    onSuccess: () => { toast.success('Price record approved and live.'); queryClient.invalidateQueries({ queryKey: ['pending-submissions'] }); },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => approvePriceRecord(id, { priceRecordId: id, approved: false, rejectionReason: reason }),
    onSuccess: () => { toast.success('Submission rejected.'); setRejectId(null); setReason(''); queryClient.invalidateQueries({ queryKey: ['pending-submissions'] }); },
  });

  if (!isAuthenticated || !hasRole('ADMIN')) return <Navigate to="/dashboard" replace />;

  const getDaysPendingColor = (days: number) => days <= 1 ? 'bg-secondary text-secondary-foreground' : days <= 3 ? 'bg-accent text-accent-foreground' : 'bg-destructive/10 text-destructive';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="heading-accent font-display text-2xl font-bold text-foreground">Pending Price Submissions</h1>
        {pending && <span className="rounded-full bg-accent px-3 py-0.5 text-sm font-bold text-accent-foreground">{pending.length}</span>}
      </div>

      <div className="card-ghana overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Commodity</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Market</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Price</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Submitted By</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Days</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={7} className="p-8 text-center"><div className="shimmer h-6 w-48 mx-auto rounded" /></td></tr>}
              {(pending || []).map((sub: any) => (
                <tr key={sub.id} className="border-b border-border hover:bg-muted/30 transition">
                  <td className="px-4 py-3 font-medium text-foreground">{sub.commodityName || sub.commodity}</td>
                  <td className="px-4 py-3 text-muted-foreground">{sub.marketName || sub.market}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-primary">{formatPrice(sub.price)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{sub.submittedBy || sub.agentName}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{formatDate(sub.recordedDate)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getDaysPendingColor(sub.daysPending || 0)}`}>
                      {sub.daysPending || 0}d
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => approveMutation.mutate(sub.id)}
                        className="rounded-md bg-primary p-1.5 text-primary-foreground hover:opacity-90" title="Approve">
                        <Check className="h-4 w-4" />
                      </button>
                      <button onClick={() => setRejectId(sub.id)}
                        className="rounded-md bg-destructive p-1.5 text-destructive-foreground hover:opacity-90" title="Reject">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20">
          <div className="card-ghana w-full max-w-md p-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Reject this price record</h3>
            <textarea value={reason} onChange={e => setReason(e.target.value)}
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground min-h-[100px]"
              placeholder="Reason for rejection (required)" />
            <div className="mt-4 flex gap-3 justify-end">
              <button onClick={() => { setRejectId(null); setReason(''); }}
                className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={() => rejectMutation.mutate(rejectId)} disabled={!reason.trim()}
                className="rounded-md bg-destructive px-4 py-2 text-sm font-bold text-destructive-foreground hover:opacity-90 disabled:opacity-50">Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingSubmissionsPage;
