import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ErrorBoundary } from '@/components/features/ErrorBoundary';
import { CodeDiffViewer } from '@/components/features/CodeDiffViewer';
import { ReviewCards } from '@/components/features/ReviewCards';
import { PullRequestList } from '@/components/features/PullRequestList';
import { useQuery } from '@tanstack/react-query';
import { reviewsApi } from '@/lib/api';
import { useReviews, useReview } from '@/hooks/useReviews';
import { useRepositories } from '@/hooks/useRepositories';
import { useRunSecurityAnalysis, useRunQualityAnalysis } from '@/hooks/useAnalysis';
import { toast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  GitPullRequest,
  Shield,
  Quality,
  Play,
  Loader2,
  FileCode,
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';

export function PullRequestReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: review, isLoading } = useReview(id || '');
  const runSecurityMutation = useRunSecurityAnalysis();
  const runQualityMutation = useRunQualityAnalysis();

  const handleRunSecurity = async () => {
    if (!id) return;
    try {
      await runSecurityMutation.mutateAsync(id);
      toast({ title: 'Security analysis started', variant: 'success' });
    } catch {
      toast({ title: 'Failed to start security analysis', variant: 'destructive' });
    }
  };

  const handleRunQuality = async () => {
    if (!id) return;
    try {
      await runQualityMutation.mutateAsync(id);
      toast({ title: 'Quality analysis started', variant: 'success' });
    } catch {
      toast({ title: 'Failed to start quality analysis', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="page-container">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-muted-foreground">Review not found</p>
          <Button variant="outline" onClick={() => navigate('/reviews')} className="mt-4">
            Back to reviews
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <ErrorBoundary>
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/reviews')}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Reviews
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                Review #{review.id.slice(0, 8)}
              </h1>
              {review.pull_request && (
                <p className="mt-1 text-muted-foreground">
                  PR: {review.pull_request.title}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant="outline"
                  className={cn(
                    'capitalize',
                    review.status === 'completed' && 'text-green-500 border-green-500/30',
                    review.status === 'in_progress' && 'text-blue-500 border-blue-500/30',
                    review.status === 'failed' && 'text-red-500 border-red-500/30',
                  )}
                >
                  {review.status.replace(/_/g, ' ')}
                </Badge>
                {review.risk_score && (
                  <Badge
                    variant="outline"
                    className={cn(
                      review.risk_score > 0.7 ? 'text-red-500 border-red-500/30' :
                      review.risk_score > 0.4 ? 'text-yellow-500 border-yellow-500/30' :
                      'text-green-500 border-green-500/30',
                    )}
                  >
                    Risk: {(review.risk_score * 100).toFixed(0)}%
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground">
                  {formatDate(review.created_at)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRunSecurity}
                disabled={runSecurityMutation.isPending}
                className="gap-2"
              >
                {runSecurityMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4" />
                )}
                Security Scan
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRunQuality}
                disabled={runQualityMutation.isPending}
                className="gap-2"
              >
                {runQualityMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileCode className="h-4 w-4" />
                )}
                Quality Check
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        {review.summary && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Review Summary</h3>
              <p className="text-sm text-muted-foreground">{review.summary}</p>
              <div className="flex gap-6 mt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-500">{review.critical_issues}</p>
                  <p className="text-xs text-muted-foreground">Critical</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-500">{review.major_issues}</p>
                  <p className="text-xs text-muted-foreground">Major</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-500">{review.minor_issues}</p>
                  <p className="text-xs text-muted-foreground">Minor</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-500">{review.security_issues}</p>
                  <p className="text-xs text-muted-foreground">Security</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">{review.quality_issues}</p>
                  <p className="text-xs text-muted-foreground">Quality</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="code">Code Changes</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {review.comments?.map((comment) => (
              <Card key={comment.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn(
                      comment.severity === 'critical' && 'border-red-500 text-red-500',
                      comment.severity === 'major' && 'border-orange-500 text-orange-500',
                    )}>
                      {comment.severity}
                    </Badge>
                    <CardTitle className="text-sm">{comment.title}</CardTitle>
                  </div>
                  <p className="text-xs text-muted-foreground">{comment.file_path}:{comment.line_start}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{comment.description}</p>
                  {comment.suggestion && (
                    <div className="mt-2 p-3 rounded-md bg-muted">
                      <p className="text-xs font-medium text-green-500 mb-1">Suggestion:</p>
                      <p className="text-sm">{comment.suggestion}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="code">
            <CodeDiffViewer fileName={review.pull_request?.source_branch} />
          </TabsContent>

          <TabsContent value="comments">
            <div className="text-center py-12 text-muted-foreground">
              Review comment threads will appear here
            </div>
          </TabsContent>
        </Tabs>
      </ErrorBoundary>
    </div>
  );
}
