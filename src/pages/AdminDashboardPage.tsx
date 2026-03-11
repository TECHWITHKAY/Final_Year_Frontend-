import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getDataQuality } from '@/api/analytics';
import { getHealthScores, recomputeHealth } from '@/api/health';
import { recomputeSeasonal } from '@/api/seasonal';
import { getDashboardSummary } from '@/api/priceRecords';
import { StatCard } from '@/components/ui/StatCard';
import { GradeTag } from '@/components/shared/GradeTag';
import { Users, ClipboardList, Database, Download, RefreshCw, Leaf } from 'lucide-react';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { GRADE_COLORS } from '@/utils/constants';

const AdminDashboardPage: React.FC = () => {
  const { isAuthenticated, hasRole } = useAuth();
  const queryClient = useQueryClient();

  if (!isAuthenticated || !hasRole('ADMIN')) return <Navigate to="/dashboard" replace />;

  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => getDashboardSummary().then(r => r.data?.data || r.data),
  });

  const { data: dataQuality } = useQuery({
    queryKey: ['data-quality'],
    queryFn: () => getDataQuality().then(r => r.data?.data || r.data),
  });

  const { data: healthScores } = useQuery({
    queryKey: ['health-scores'],
    queryFn: () => getHealthScores().then(r => r.data?.data || r.data || []),
  });

  const recomputeHealthMutation = useMutation({
    mutationFn: recomputeHealth,
    onSuccess: () => { toast.success('Health scores recomputed'); queryClient.invalidateQueries({ queryKey: ['health-scores'] }); },
  });

  const recomputeSeasonalMutation = useMutation({
    mutationFn: recomputeSeasonal,
    onSuccess: () => { toast.success('Seasonal data recomputed'); queryClient.invalidateQueries({ queryKey: ['seasonal'] }); },
  });

  // Grade distribution for donut
  const gradeCounts = ['A', 'B', 'C', 'D', 'F'].map(grade => ({
    name: grade,
    value: (healthScores || []).filter((h: any) => h.grade === grade).length,
    fill: GRADE_COLORS[grade],
  })).filter(g => g.value > 0);

  return (
    <div className="space-y-6">
      <h1 className="heading-accent font-display text-2xl font-bold text-foreground">Admin Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={summary?.totalUsers || 0} icon={Users} loading={isLoading} />
        <StatCard title="Pending Submissions" value={summary?.pendingCount || 0} icon={ClipboardList} loading={isLoading} />
        <StatCard title="Price Records" value={summary?.totalPriceRecords || 0} icon={Database} loading={isLoading} />
        <StatCard title="Exports This Month" value={summary?.exportsThisMonth || 0} icon={Download} loading={isLoading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Data Quality */}
        {dataQuality && (
          <div className="card-ghana p-6">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">Data Quality Overview</h2>
            <div className="text-center">
              <p className="font-mono text-5xl font-bold text-primary">{dataQuality.completeness || 0}%</p>
              <p className="mt-1 text-sm text-muted-foreground">Overall Completeness</p>
            </div>
            <Link to="/analytics#data-quality" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">View Full Report →</Link>
          </div>
        )}

        {/* Grade Distribution */}
        <div className="card-ghana p-6">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">Market Health Summary</h2>
          {gradeCounts.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={gradeCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                  {gradeCounts.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-8">No health data available</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => recomputeHealthMutation.mutate()} disabled={recomputeHealthMutation.isPending}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${recomputeHealthMutation.isPending ? 'animate-spin' : ''}`} /> Recompute Health Scores
        </button>
        <button onClick={() => recomputeSeasonalMutation.mutate()} disabled={recomputeSeasonalMutation.isPending}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition disabled:opacity-50">
          <Leaf className={`h-4 w-4 ${recomputeSeasonalMutation.isPending ? 'animate-spin' : ''}`} /> Recompute Seasonal
        </button>
        <Link to="/export" className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition">
          <Download className="h-4 w-4" /> View All Exports
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
