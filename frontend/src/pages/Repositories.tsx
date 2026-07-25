import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ErrorBoundary } from '@/components/features/ErrorBoundary';
import { RepositoryCards } from '@/components/features/RepositoryCards';
import { repositoriesApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import {
  Search,
  Plus,
  RefreshCw,
  GitBranch,
} from 'lucide-react';

export function Repositories() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const { data: reposData, isLoading, refetch } = useQuery({
    queryKey: ['repositories', searchQuery],
    queryFn: () => repositoriesApi.list({ search: searchQuery || undefined }),
  });

  const handleSync = async (id: string) => {
    try {
      await repositoriesApi.sync(id);
      toast({ title: 'Repository synced successfully', variant: 'success' });
      refetch();
    } catch {
      toast({ title: 'Failed to sync repository', variant: 'destructive' });
    }
  };

  const repositories = reposData?.items || [];

  const filteredRepos = activeTab === 'all'
    ? repositories
    : activeTab === 'github'
      ? repositories.filter((r) => r.provider === 'github')
      : repositories.filter((r) => r.language?.toLowerCase() === activeTab);

  return (
    <div className="page-container">
      <ErrorBoundary>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Repositories</h1>
            <p className="mt-1 text-muted-foreground">
              Manage and monitor your connected repositories
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Repository
            </Button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="github">GitHub</TabsTrigger>
            <TabsTrigger value="typescript">TypeScript</TabsTrigger>
            <TabsTrigger value="python">Python</TabsTrigger>
            <TabsTrigger value="go">Go</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Repository Cards */}
        <RepositoryCards
          repositories={filteredRepos}
          isLoading={isLoading}
          onSync={handleSync}
          onSelect={(repo) => navigate(`/repositories/${repo.id}`)}
        />
      </ErrorBoundary>
    </div>
  );
}
