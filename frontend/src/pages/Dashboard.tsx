import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricsDashboard } from '@/components/features/MetricsDashboard';
import { ReviewCards } from '@/components/features/ReviewCards';
import { ErrorBoundary } from '@/components/features/ErrorBoundary';
import { useDashboardMetrics } from '@/hooks/useAuth';
import { useReviews } from '@/hooks/useReviews';
import { useNavigate } from 'react-router-dom';
import {
  GitBranch,
  Plus,
  ArrowRight,
  Activity,
  Zap,
  Clock,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function Dashboard() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: reviewsData, isLoading: reviewsLoading } = useReviews({ size: 5 });

  const quickActions = [
    {
      title: 'New Repository',
      description: 'Connect a repository for AI review',
      icon: GitBranch,
      onClick: () => navigate('/repositories'),
      color: 'bg-blue-500/10 text-blue-500',
    },
    {
      title: 'Run Review',
      description: 'Start a new code review',
      icon: Zap,
      onClick: () => navigate('/reviews'),
      color: 'bg-purple-500/10 text-purple-500',
    },
    {
      title: 'View Security',
      description: 'Check security findings',
      icon: Activity,
      onClick: () => navigate('/security'),
      color: 'bg-red-500/10 text-red-500',
    },
  ];

  return (
    <div className="page-container">
      <ErrorBoundary>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.display_name || user?.username}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Here's what's happening with your repositories
            </p>
          </div>
          <Button onClick={() => navigate('/repositories')} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Repository
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {quickActions.map((action) => (
            <Card
              key={action.title}
              className="card-hover cursor-pointer"
              onClick={action.onClick}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`rounded-lg p-3 ${action.color}`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Metrics */}
        <div className="mb-8">
          <MetricsDashboard metrics={metrics} isLoading={metricsLoading} />
        </div>

        {/* Recent Reviews */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Recent Reviews
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/reviews')}
              className="gap-2"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <ReviewCards
            reviews={reviewsData?.items || []}
            isLoading={reviewsLoading}
            onSelect={(review) => navigate(`/reviews/${review.id}`)}
          />
        </div>
      </ErrorBoundary>
    </div>
  );
}
