import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatDate, getStatusColor } from '@/lib/utils';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Brain,
} from 'lucide-react';
import type { Review } from '@/types';

interface ReviewCardsProps {
  reviews: Review[];
  isLoading: boolean;
  onSelect?: (review: Review) => void;
}

const statusIcons: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  in_progress: <Clock className="h-5 w-5 text-blue-500" />,
  pending: <Clock className="h-5 w-5 text-yellow-500" />,
  failed: <XCircle className="h-5 w-5 text-red-500" />,
  cancelled: <XCircle className="h-5 w-5 text-gray-500" />,
};

export function ReviewCards({ reviews, isLoading, onSelect }: ReviewCardsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <div className="flex gap-4">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="rounded-full bg-muted p-4">
          <Brain className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No reviews yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Reviews will appear here once pull requests are analyzed
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card
          key={review.id}
          className={cn(
            'card-hover cursor-pointer',
            onSelect && 'hover:border-primary/50',
          )}
          onClick={() => onSelect?.(review)}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="mt-1">{statusIcons[review.status] || statusIcons.pending}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold truncate">
                    Review #{review.id.slice(0, 8)}
                  </h4>
                  <Badge
                    variant="outline"
                    className={cn('text-xs capitalize', getStatusColor(review.status))}
                  >
                    {review.status.replace(/_/g, ' ')}
                  </Badge>
                  {review.decision && (
                    <Badge
                      variant="outline"
                      className={cn('text-xs capitalize', getStatusColor(review.decision))}
                    >
                      {review.decision.replace(/_/g, ' ')}
                    </Badge>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {review.total_issues} issues
                  </span>
                  <span className="flex items-center gap-1 text-red-500">
                    <AlertTriangle className="h-3 w-3" />
                    {review.critical_issues} critical
                  </span>
                  {review.ai_confidence_score && (
                    <span className="flex items-center gap-1 text-primary">
                      <Brain className="h-3 w-3" />
                      {Math.round(review.ai_confidence_score * 100)}% confidence
                    </span>
                  )}
                  {review.risk_score && (
                    <span
                      className={cn(
                        'font-medium',
                        review.risk_score > 0.7
                          ? 'text-red-500'
                          : review.risk_score > 0.4
                            ? 'text-yellow-500'
                            : 'text-green-500',
                      )}
                    >
                      Risk: {review.risk_score.toFixed(2)}
                    </span>
                  )}
                </div>

                {review.summary && (
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                    {review.summary}
                  </p>
                )}

                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatDate(review.created_at)}</span>
                  {review.completed_at && (
                    <>
                      <span>·</span>
                      <span>Completed {formatDate(review.completed_at)}</span>
                    </>
                  )}
                  {review.is_automatic && (
                    <>
                      <span>·</span>
                      <Badge variant="secondary" className="text-[10px]">
                        AI Review
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
