import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatDate, getSeverityColor, getCategoryIcon } from '@/lib/utils';
import {
  Shield,
  FileCode,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import type { SecurityFinding } from '@/types';
import { useState } from 'react';

interface SecurityIssueCardsProps {
  findings: SecurityFinding[];
  isLoading: boolean;
  onSelect?: (finding: SecurityFinding) => void;
}

export function SecurityIssueCards({ findings, isLoading, onSelect }: SecurityIssueCardsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (findings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="rounded-full bg-green-500/10 p-4">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No security findings</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          No security issues were found in the codebase
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {findings.map((finding) => (
        <Card
          key={finding.id}
          className={cn(
            'card-hover cursor-pointer border-l-4',
            finding.severity === 'critical' && 'border-l-red-500',
            finding.severity === 'high' && 'border-l-orange-500',
            finding.severity === 'medium' && 'border-l-yellow-500',
            finding.severity === 'low' && 'border-l-blue-500',
            finding.severity === 'info' && 'border-l-gray-500',
          )}
          onClick={() => {
            if (onSelect) onSelect(finding);
            setExpandedId(expandedId === finding.id ? null : finding.id);
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Shield
                  className={cn(
                    'h-5 w-5',
                    finding.severity === 'critical' && 'text-red-500',
                    finding.severity === 'high' && 'text-orange-500',
                    finding.severity === 'medium' && 'text-yellow-500',
                    finding.severity === 'low' && 'text-blue-500',
                    finding.severity === 'info' && 'text-gray-500',
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold capitalize">
                    {finding.category.replace(/_/g, ' ')}
                  </h4>
                  <Badge
                    variant="outline"
                    className={cn('text-xs capitalize', getSeverityColor(finding.severity))}
                  >
                    {finding.severity}
                  </Badge>
                  {finding.cvss_score && (
                    <Badge variant="secondary" className="text-xs">
                      CVSS {finding.cvss_score.toFixed(1)}
                    </Badge>
                  )}
                </div>

                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {finding.description}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileCode className="h-3 w-3" />
                    {finding.file_path}:{finding.line_start}
                  </span>
                  {finding.cwe_id && (
                    <Badge variant="outline" className="text-[10px]">
                      {finding.cwe_id}
                    </Badge>
                  )}
                  {finding.owasp_category && (
                    <Badge variant="outline" className="text-[10px]">
                      {finding.owasp_category}
                    </Badge>
                  )}
                  <span>{formatDate(finding.created_at)}</span>
                </div>

                {/* Expanded Details */}
                {expandedId === finding.id && (
                  <div className="mt-3 space-y-3 border-t pt-3">
                    {finding.impact && (
                      <div>
                        <h5 className="text-xs font-semibold text-muted-foreground mb-1">Impact</h5>
                        <p className="text-sm">{finding.impact}</p>
                      </div>
                    )}
                    {finding.remediation && (
                      <div>
                        <h5 className="text-xs font-semibold text-green-500 mb-1">Remediation</h5>
                        <p className="text-sm text-green-600 dark:text-green-400">{finding.remediation}</p>
                      </div>
                    )}
                    {finding.vulnerable_code && (
                      <div>
                        <h5 className="text-xs font-semibold text-muted-foreground mb-1">Vulnerable Code</h5>
                        <pre className="rounded-md bg-muted p-3 text-xs overflow-x-auto">
                          <code>{finding.vulnerable_code}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
