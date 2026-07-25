import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ErrorBoundary } from '@/components/features/ErrorBoundary';
import { SecurityIssueCards } from '@/components/features/SecurityIssueCards';
import { useAllSecurityFindings } from '@/hooks/useAnalysis';
import {
  Search,
  Shield,
  ShieldAlert,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function SecurityFindings() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: findingsData, isLoading } = useAllSecurityFindings({
    severity: severityFilter !== 'all' ? severityFilter : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
  });

  const findings = findingsData?.items || [];
  const filteredFindings = searchQuery
    ? findings.filter(
        (f) =>
          f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.file_path.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : findings;

  const severityCounts = {
    critical: findings.filter((f) => f.severity === 'critical').length,
    high: findings.filter((f) => f.severity === 'high').length,
    medium: findings.filter((f) => f.severity === 'medium').length,
    low: findings.filter((f) => f.severity === 'low').length,
    info: findings.filter((f) => f.severity === 'info').length,
  };

  return (
    <div className="page-container">
      <ErrorBoundary>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Security Findings</h1>
            <p className="mt-1 text-muted-foreground">
              Security vulnerabilities and issues detected across your repositories
            </p>
          </div>
        </div>

        {/* Severity Overview */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {Object.entries(severityCounts).map(([severity, count]) => (
            <Card
              key={severity}
              className={cn(
                'cursor-pointer transition-all',
                severityFilter === severity && 'ring-2 ring-primary',
              )}
              onClick={() => setSeverityFilter(severityFilter === severity ? 'all' : severity)}
            >
              <CardContent className="p-4 text-center">
                <div className={cn(
                  'text-2xl font-bold',
                  severity === 'critical' && 'text-red-500',
                  severity === 'high' && 'text-orange-500',
                  severity === 'medium' && 'text-yellow-500',
                  severity === 'low' && 'text-blue-500',
                  severity === 'info' && 'text-gray-500',
                )}>
                  {count}
                </div>
                <p className="text-xs text-muted-foreground capitalize mt-1">{severity}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search findings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="sql_injection">SQL Injection</SelectItem>
              <SelectItem value="xss">XSS</SelectItem>
              <SelectItem value="hardcoded_secret">Hardcoded Secrets</SelectItem>
              <SelectItem value="command_injection">Command Injection</SelectItem>
              <SelectItem value="ssrf">SSRF</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Findings List */}
        <SecurityIssueCards
          findings={filteredFindings}
          isLoading={isLoading}
          onSelect={(finding) => navigate(`/reviews/${finding.review_id}`)}
        />
      </ErrorBoundary>
    </div>
  );
}
