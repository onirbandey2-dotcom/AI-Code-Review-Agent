import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ErrorBoundary } from '@/components/features/ErrorBoundary';
import { SecurityIssueCards } from '@/components/features/SecurityIssueCards';
import { useQuery } from '@tanstack/react-query';
import { reviewsApi } from '@/lib/api';
import { useSecurityFindings, useQualityReport, useComplexityMetrics, useDuplicateBlocks, useCodeSmells } from '@/hooks/useAnalysis';
import {
  ArrowLeft,
  Shield,
  GitBranch,
  Copy,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

export function ReviewResults() {
  const { reviewId } = useParams<{ reviewId: string }>();
  const navigate = useNavigate();

  const { data: review, isLoading: reviewLoading } = useQuery({
    queryKey: ['review', reviewId],
    queryFn: () => reviewsApi.getById(reviewId || ''),
    enabled: !!reviewId,
  });

  const { data: securityFindings, isLoading: securityLoading } = useSecurityFindings(reviewId || '');
  const { data: qualityReport, isLoading: qualityLoading } = useQualityReport(reviewId || '');
  const { data: complexityMetrics } = useComplexityMetrics(reviewId || '');
  const { data: duplicateBlocks } = useDuplicateBlocks(reviewId || '');
  const { data: codeSmells } = useCodeSmells(reviewId || '');

  if (reviewLoading) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <ErrorBoundary>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/reviews')}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reviews
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">Review Results</h1>
          <p className="mt-1 text-muted-foreground">
            Detailed analysis results for review #{reviewId?.slice(0, 8)}
          </p>
        </div>

        {/* Quality Score Overview */}
        {qualityReport && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="relative h-24 w-24">
                  <svg className="h-full w-full" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="3"
                      strokeDasharray={`${qualityReport.overall_score * 100}, 100`}
                    />
                    <text x="18" y="20.5" textAnchor="middle" className="text-2xl font-bold" fill="currentColor">
                      {(qualityReport.overall_score * 100).toFixed(0)}
                    </text>
                  </svg>
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">Quality Score</h3>
                  <p className="text-sm text-muted-foreground">
                    {qualityReport.maintainability_index && `Maintainability: ${qualityReport.maintainability_index.toFixed(1)}`}
                  </p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>{qualityReport.total_lines} lines</span>
                    <span>{qualityReport.total_functions} functions</span>
                    <span>{qualityReport.total_classes} classes</span>
                    {qualityReport.test_coverage && <span>Coverage: {(qualityReport.test_coverage * 100).toFixed(0)}%</span>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Tabs */}
        <Tabs defaultValue="security">
          <TabsList className="mb-6">
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Security ({securityFindings?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="complexity" className="gap-2">
              <GitBranch className="h-4 w-4" />
              Complexity
            </TabsTrigger>
            <TabsTrigger value="duplications" className="gap-2">
              <Copy className="h-4 w-4" />
              Duplications
            </TabsTrigger>
            <TabsTrigger value="smells" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Code Smells
            </TabsTrigger>
          </TabsList>

          <TabsContent value="security">
            <SecurityIssueCards
              findings={securityFindings || []}
              isLoading={securityLoading}
            />
          </TabsContent>

          <TabsContent value="complexity">
            <div className="space-y-3">
              {complexityMetrics?.map((metric) => (
                <Card key={metric.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold">{metric.function_name}</h4>
                        <p className="text-xs text-muted-foreground">{metric.file_path}:{metric.line_start}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{metric.cyclomatic_complexity}</p>
                        <p className="text-xs text-muted-foreground">Complexity</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="duplications">
            <div className="space-y-3">
              {duplicateBlocks?.map((block) => (
                <Card key={block.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">{block.file_path_1}:{block.start_line_1}</p>
                        <p className="text-sm text-muted-foreground">{block.file_path_2}:{block.start_line_2}</p>
                      </div>
                      <Badge variant="warning">{block.similarity_percentage.toFixed(0)}% similar</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="smells">
            <div className="space-y-3">
              {codeSmells?.map((smell) => (
                <Card key={smell.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold capitalize">{smell.smell_type.replace(/_/g, ' ')}</h4>
                        <p className="text-sm text-muted-foreground">{smell.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{smell.file_path}:{smell.line_start}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </ErrorBoundary>
    </div>
  );
}

export default ReviewResults;
