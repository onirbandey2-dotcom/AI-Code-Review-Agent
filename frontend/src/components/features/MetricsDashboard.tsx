import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  GitBranch,
  GitPullRequest,
  Shield,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Code2,
} from 'lucide-react';
import type { DashboardMetrics } from '@/types';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
}

function MetricCard({ title, value, description, icon, trend, trendValue, color }: MetricCardProps) {
  return (
    <Card className="card-hover">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold">{value}</h3>
              {trend && (
                <span className={cn(
                  'flex items-center text-xs font-medium',
                  trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground',
                )}>
                  {trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {trendValue}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className={cn(
            'rounded-lg p-3',
            color || 'bg-primary/10',
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface MetricsDashboardProps {
  metrics?: DashboardMetrics;
  isLoading: boolean;
}

export function MetricsDashboard({ metrics, isLoading }: MetricsDashboardProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Repositories"
          value={metrics.total_repositories}
          icon={<GitBranch className="h-5 w-5 text-primary" />}
          color="bg-primary/10"
        />
        <MetricCard
          title="Pull Requests"
          value={metrics.total_pull_requests}
          icon={<GitPullRequest className="h-5 w-5 text-blue-500" />}
          color="bg-blue-500/10"
        />
        <MetricCard
          title="Security Findings"
          value={metrics.total_security_findings}
          icon={<Shield className="h-5 w-5 text-red-500" />}
          color="bg-red-500/10"
          trend="down"
          trendValue="12%"
        />
        <MetricCard
          title="Avg. Quality Score"
          value={`${(metrics.average_quality_score * 100).toFixed(0)}%`}
          icon={<Code2 className="h-5 w-5 text-green-500" />}
          color="bg-green-500/10"
          trend={metrics.average_quality_score >= 0.7 ? 'up' : 'down'}
          trendValue={metrics.average_quality_score >= 0.7 ? '5%' : '2%'}
        />
      </div>

      {/* Top Issues */}
      {metrics.top_issues && metrics.top_issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Top Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.top_issues.slice(0, 5).map((issue) => (
                <div key={issue.category} className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium capitalize">
                      {issue.category.replace(/_/g, ' ')}
                    </p>
                    <div className="mt-1 h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{
                          width: `${Math.min(
                            (issue.count / Math.max(...metrics.top_issues.map((i) => i.count))) * 100,
                            100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold">{issue.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {metrics.activity_data && metrics.activity_data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-32">
              {metrics.activity_data.slice(-14).map((day) => {
                const maxVal = Math.max(
                  ...metrics.activity_data.map((d) => d.reviews + d.findings),
                  1,
                );
                const height = ((day.reviews + day.findings) / maxVal) * 100;
                return (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center gap-1"
                    title={`${day.date}: ${day.reviews} reviews, ${day.findings} findings`}
                  >
                    <div
                      className="w-full rounded-t bg-primary/60 hover:bg-primary transition-colors"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(day.date).getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
