import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  GitPullRequest,
  GitMerge,
  GitBranch,
} from 'lucide-react';

import { cn, formatDate } from '@/lib/utils';
import type { PullRequest } from '@/types';

interface PullRequestListProps {
  pullRequests: PullRequest[];
  isLoading: boolean;
  onSelect?: (pr: PullRequest) => void;
}

const statusStyles: Record<string, string> = {
  open: 'text-green-500 bg-green-500/10 border-green-500/20',
  merged: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  closed: 'text-red-500 bg-red-500/10 border-red-500/20',
  draft: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
};

export function PullRequestList({
  pullRequests,
  isLoading,
  onSelect,
}: PullRequestListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-5 rounded" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-[70%]" />
                  <Skeleton className="h-3 w-[40%]" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (pullRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="rounded-full bg-muted p-4">
          <GitPullRequest className="h-8 w-8 text-muted-foreground" />
        </div>

        <h3 className="mt-4 text-lg font-semibold">
          No pull requests
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Pull requests will appear here once they are created.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pullRequests.map((pr) => (
        <Card
          key={pr.id}
          className={cn(
            'card-hover cursor-pointer',
            onSelect && 'hover:border-primary/50'
          )}
          onClick={() => onSelect?.(pr)}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="mt-0.5">
                {pr.is_merged ? (
                  <GitMerge className="h-5 w-5 text-purple-500" />
                ) : (
                  <GitPullRequest
                    className={cn(
                      'h-5 w-5',
                      pr.state === 'open'
                        ? 'text-green-500'
                        : 'text-red-500'
                    )}
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="truncate text-sm font-semibold">
                    {pr.title}
                  </h4>

                  <Badge
                    variant="outline"
                    className={cn(
                      'shrink-0 text-xs capitalize',
                      statusStyles[pr.state] ?? statusStyles.draft
                    )}
                  >
                    {pr.state}
                  </Badge>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>#{pr.provider_pr_id}</span>
                  <span>by {pr.author}</span>
                  <span>{formatDate(pr.created_at)}</span>

                  {pr.labels?.slice(0, 3).map((label) => (
                    <Badge
                      key={label}
                      variant="secondary"
                      className="text-[10px]"
                    >
                      {label}
                    </Badge>
                  ))}
                </div>

                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <GitBranch className="h-3 w-3" />
                    {pr.source_branch}
                  </span>

                  <span className="text-green-500">
                    +{pr.additions}
                  </span>

                  <span className="text-red-500">
                    -{pr.deletions}
                  </span>

                  <span>{pr.changed_files} files</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}