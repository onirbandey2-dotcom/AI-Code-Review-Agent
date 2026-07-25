import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  GitBranch,
  GitPullRequest,
  Star,
  ExternalLink,
  Globe,
  Lock,
  MoreHorizontal,
  RefreshCw,
} from 'lucide-react';
import { cn, formatDate, formatNumber } from '@/lib/utils';
import type { Repository } from '@/types';

interface RepositoryCardsProps {
  repositories: Repository[];
  isLoading: boolean;
  onSync?: (id: string) => void;
  onSelect?: (repo: Repository) => void;
}

export function RepositoryCards({ repositories, isLoading, onSync, onSelect }: RepositoryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <div className="flex gap-2 pt-2">
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

  if (repositories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="rounded-full bg-muted p-4">
          <GitBranch className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No repositories yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect a repository to get started with AI code reviews
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {repositories.map((repo) => (
        <Card
          key={repo.id}
          className={cn(
            'card-hover cursor-pointer',
            onSelect && 'hover:border-primary/50',
          )}
          onClick={() => onSelect?.(repo)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="shrink-0">
                  {repo.is_private ? (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Globe className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <CardTitle className="text-base truncate">{repo.name}</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 -mr-2 -mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onSync?.(repo.id);
                }}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            {repo.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {repo.description}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-2">
              {repo.language && (
                <Badge variant="secondary" className="text-xs">
                  {repo.language}
                </Badge>
              )}
              {repo.topics?.slice(0, 3).map((topic) => (
                <Badge key={topic} variant="outline" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <GitPullRequest className="h-3 w-3" />
                {repo.pull_request_count || 0} PRs
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {formatNumber(0)}
              </span>
              <span className="ml-auto">
                {repo.last_synced_at ? formatDate(repo.last_synced_at) : 'Not synced'}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
