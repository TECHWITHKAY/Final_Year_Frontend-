import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getDataQualityReport } from '@/api/analytics';
import { getDashboardSummary } from '@/api/public';
import { getAllHealthScores, recomputeHealthScores } from '@/api/health';
import { recomputeAllPatterns } from '@/api/seasonal';
import { getPendingAgents, approveAgent, rejectAgent } from '@/api/users';
import { StatCard } from '@/components/ui/StatCard';
import { GradeTag } from '@/components/shared/GradeTag';
import { 
  Users, ClipboardList, Database, Download, RefreshCw, 
  Leaf, CheckCircle, XCircle, MapPin, FileText, 
  AlertCircle, ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { GRADE_COLORS } from '@/utils/constants';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboardPage: React.FC = () => {
  const { isAuthenticated, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  if (!isAuthenticated || !hasRole('ADMIN')) return <Navigate to="/dashboard" replace />;

  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => getDashboardSummary().then(r => r.data?.data || r.data),
  });

  const { data: dataQuality } = useQuery({
    queryKey: ['data-quality'],
    queryFn: () => getDataQualityReport().then(r => r.data?.data || r.data),
  });

  const { data: healthScores } = useQuery({
    queryKey: ['health-scores'],
    queryFn: () => getAllHealthScores().then(r => r.data?.data || r.data || []),
  });

  const { data: pendingAgents, isLoading: isLoadingPending } = useQuery({
    queryKey: ['pending-agents'],
    queryFn: () => getPendingAgents().then(r => r.data?.data || r.data || []),
  });

  const recomputeHealthMutation = useMutation({
    mutationFn: recomputeHealthScores,
    onSuccess: () => { toast.success('Health scores recomputed'); queryClient.invalidateQueries({ queryKey: ['health-scores'] }); },
  });

  const recomputeSeasonalMutation = useMutation({
    mutationFn: recomputeAllPatterns,
    onSuccess: () => { toast.success('Seasonal data recomputed'); queryClient.invalidateQueries({ queryKey: ['seasonal'] }); },
  });

  const approveMutation = useMutation({
    mutationFn: approveAgent,
    onSuccess: () => {
      toast.success('Agent approved and notified!');
      queryClient.invalidateQueries({ queryKey: ['pending-agents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to approve agent')
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => rejectAgent(id, reason),
    onSuccess: () => {
      toast.success('Agent application rejected.');
      setRejectId(null);
      setRejectReason('');
      queryClient.invalidateQueries({ queryKey: ['pending-agents'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to reject agent')
  });

  // Grade distribution for donut
  const gradeCounts = ['A', 'B', 'C', 'D', 'F'].map(grade => ({
    name: grade,
    value: (healthScores || []).filter((h: any) => h.grade === grade).length,
    fill: GRADE_COLORS[grade],
  })).filter(g => g.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="heading-accent font-display text-2xl font-bold text-foreground">Admin Command Center</h1>
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted px-3 py-1 rounded-full">
          Secure Access
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={summary?.totalUsers || 0} icon={Users} loading={isLoading} />
        <StatCard title="Pending Records" value={summary?.pendingCount || 0} icon={ClipboardList} loading={isLoading} />
        <StatCard title="Price Records" value={summary?.totalPriceRecords || 0} icon={Database} loading={isLoading} />
        <StatCard title="Exports (Mo)" value={summary?.exportsThisMonth || 0} icon={Download} loading={isLoading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Data Quality */}
        <div className="card-ghana p-6 flex flex-col justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">Data Quality</h2>
            <div className="flex items-center gap-6">
               <div className="relative">
                  <svg className="h-24 w-24">
                    <circle className="text-muted/20" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="48" cy="48" />
                    <circle 
                      className="text-primary" strokeWidth="8" strokeDasharray={40 * 2 * Math.PI} 
                      strokeDashoffset={40 * 2 * Math.PI * (1 - (dataQuality?.overallCompleteness || 0) / 100)} 
                      strokeLinecap="round" stroke="currentColor" fill="transparent" r="40" cx="48" cy="48" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-foreground">
                    {dataQuality?.overallCompleteness?.toFixed(0) || 0}%
                  </div>
               </div>
               <div>
                  <p className="text-sm font-medium text-foreground">Healthy completeness</p>
                  <p className="text-xs text-muted-foreground">Across all commodities and markets tracked this month.</p>
               </div>
            </div>
          </div>
          <Link to="/analytics#data-quality" className="mt-6 text-sm font-bold text-primary hover:text-primary-mid flex items-center gap-1">
            Full Quality Report <ShieldCheck className="h-4 w-4" />
          </Link>
        </div>

        {/* Grade Distribution */}
        <div className="card-ghana p-6">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">Market Health</h2>
          {gradeCounts.length > 0 ? (
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={gradeCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2}>
                    {gradeCounts.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Legend verticalAlign="middle" align="right" layout="vertical" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[180px] flex items-center justify-center">
               <p className="text-sm text-muted-foreground italic">No health data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Field Agent Applications */}
      <div className="card-ghana overflow-hidden bg-[linear-gradient(to_bottom_right,_var(--tw-gradient-stops))] from-card to-muted/5">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">Field Agent Applications</h2>
            <p className="text-sm text-muted-foreground">Review new account requests from potential agents.</p>
          </div>
          <div className="flex items-center gap-2 bg-accent/10 border border-accent/20 px-3 py-1 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="text-accent text-[10px] font-black uppercase tracking-widest">{pendingAgents?.length || 0} New</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <tbody className="divide-y divide-border">
              {pendingAgents && pendingAgents.length > 0 ? (
                pendingAgents.map((u: any) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-6">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shadow-inner">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="space-y-1">
                          <p className="text-base font-bold text-foreground">{u.username}</p>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                          <div className="flex gap-4 mt-2">
                             <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                                <MapPin className="h-3 w-3" /> {u.operatingCity || 'No city provided'}
                             </div>
                             <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                                <FileText className="h-3 w-3" /> Note: {u.applicationNote ? 'Provided' : 'None'}
                             </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 max-w-sm">
                       {u.applicationNote && (
                         <div className="text-xs text-muted-foreground bg-background/50 p-3 rounded-xl border border-border/50 italic leading-relaxed">
                            "{u.applicationNote}"
                         </div>
                       )}
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => approveMutation.mutate(u.id)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                          className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:opacity-90 transition shadow-sm flex items-center gap-2 disabled:opacity-50"
                        >
                          <CheckCircle className="h-4 w-4" /> Approve
                        </button>
                        <button 
                          onClick={() => setRejectId(u.id)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                          className="px-4 py-2 bg-destructive/10 text-destructive text-xs font-bold rounded-lg hover:bg-destructive hover:text-white transition flex items-center gap-2 disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                       <CheckCircle className="h-12 w-12 text-muted/30 mb-4" />
                       <p className="text-muted-foreground font-medium">All caught up! No pending agent applications.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Reason Modal */}
      <AnimatePresence>
        {rejectId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-background/80 backdrop-blur-sm"
               onClick={() => setRejectId(null)}
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-md bg-card p-8 rounded-2xl shadow-2xl border border-destructive/20"
            >
              <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                 <AlertCircle className="text-destructive h-5 w-5" /> Reject Application
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Please provide a reason for rejecting this field agent application. This reason will be emailed to the applicant.
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full rounded-xl border border-input bg-background p-4 text-sm focus:outline-none focus:ring-2 focus:ring-destructive/50 transition-all min-h-[120px]"
                placeholder="Briefly explain the decision..."
                autoFocus
              />
              <div className="flex justify-end gap-3 mt-8">
                <button onClick={() => setRejectId(null)} className="px-5 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground transition">
                  Cancel
                </button>
                <button 
                  onClick={() => rejectMutation.mutate({ id: rejectId, reason: rejectReason })}
                  disabled={!rejectReason.trim()}
                  className="px-6 py-2.5 bg-destructive text-white text-sm font-bold rounded-xl shadow-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* System Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => recomputeHealthMutation.mutate()} disabled={recomputeHealthMutation.isPending}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold text-foreground hover:bg-muted/50 transition shadow-sm disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${recomputeHealthMutation.isPending ? 'animate-spin' : ''}`} /> Sync Health Scores
        </button>
        <button onClick={() => recomputeSeasonalMutation.mutate()} disabled={recomputeSeasonalMutation.isPending}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold text-foreground hover:bg-muted/50 transition shadow-sm disabled:opacity-50">
          <Leaf className={`h-4 w-4 ${recomputeSeasonalMutation.isPending ? 'animate-spin' : ''}`} /> Refresh Seasonal
        </button>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
