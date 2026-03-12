import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getDataQualityReport } from '@/api/analytics';
import { getDashboardSummary } from '@/api/public';
import { getAllHealthScores, recomputeHealthScores } from '@/api/health';
import { recomputeAllPatterns } from '@/api/seasonal';
import { getAllUsers, setUserStatus } from '@/api/users';
import { StatCard } from '@/components/ui/StatCard';
import { GradeTag } from '@/components/shared/GradeTag';
import { Users, ClipboardList, Database, Download, RefreshCw, Leaf, CheckCircle, XCircle } from 'lucide-react';
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
    queryFn: () => getDataQualityReport().then(r => r.data?.data || r.data),
  });

  const { data: healthScores } = useQuery({
    queryKey: ['health-scores'],
    queryFn: () => getAllHealthScores().then(r => r.data?.data || r.data || []),
  });

  const { data: users, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => getAllUsers().then(r => r.data?.data || r.data || []),
  });

  const recomputeHealthMutation = useMutation({
    mutationFn: recomputeHealthScores,
    onSuccess: () => { toast.success('Health scores recomputed'); queryClient.invalidateQueries({ queryKey: ['health-scores'] }); },
  });

  const recomputeSeasonalMutation = useMutation({
    mutationFn: recomputeAllPatterns,
    onSuccess: () => { toast.success('Seasonal data recomputed'); queryClient.invalidateQueries({ queryKey: ['seasonal'] }); },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, active }: { userId: number; active: boolean }) => setUserStatus(userId, active),
    onSuccess: (_, variables) => {
      toast.success(`User ${variables.active ? 'activated and notified' : 'deactivated'}`);
      refetchUsers();
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update user status');
    }
  });

  const pendingUsers = (users || []).filter((u: any) => !u.active && u.role === 'FIELD_AGENT');

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
              <p className="font-mono text-5xl font-bold text-primary">{dataQuality.overallCompleteness?.toFixed(1) || 0}%</p>
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

      {/* User Management */}
      <div className="card-ghana overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">Pending Approvals</h2>
            <p className="text-sm text-muted-foreground">Field agents awaiting activation</p>
          </div>
          <span className="bg-accent/10 text-accent text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            {pendingUsers.length} Pending
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Registration Details</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pendingUsers.length > 0 ? (
                pendingUsers.map((u: any) => (
                  <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{u.username}</p>
                          <p className="text-xs text-muted-foreground">ID: #{u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground">{u.email}</p>
                      <p className="text-xs text-muted-foreground italic">Applied on {new Date(u.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => updateStatusMutation.mutate({ userId: u.id, active: true })}
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary-mid transition-colors"
                      >
                        <CheckCircle className="h-4 w-4" /> Approve & Notify
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                    No pending approval requests
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
