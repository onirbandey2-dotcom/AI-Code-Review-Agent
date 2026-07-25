import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { FileCode, Plus, Minus } from 'lucide-react';
import type { ReviewComment } from '@/types';

interface DiffLine {
  type: 'add' | 'remove' | 'context';
  content: string;
  oldLine?: number;
  newLine?: number;
}

interface CodeDiffViewerProps {
  oldCode?: string;
  newCode?: string;
  comments?: ReviewComment[];
  fileName?: string;
  className?: string;
}

function generateDiffLines(oldCode?: string, newCode?: string): DiffLine[] {
  const lines: DiffLine[] = [];
  const oldLines = oldCode?.split('\n') || [];
  const newLines = newCode?.split('\n') || [];
  const maxLen = Math.max(oldLines.length, newLines.length);

  for (let i = 0; i < maxLen; i++) {
    if (i < oldLines.length && i < newLines.length) {
      if (oldLines[i] === newLines[i]) {
        lines.push({ type: 'context', content: oldLines[i], oldLine: i + 1, newLine: i + 1 });
      } else {
        lines.push({ type: 'remove', content: oldLines[i], oldLine: i + 1 });
        lines.push({ type: 'add', content: newLines[i], newLine: i + 1 });
      }
    } else if (i < oldLines.length) {
      lines.push({ type: 'remove', content: oldLines[i], oldLine: i + 1 });
    } else if (i < newLines.length) {
      lines.push({ type: 'add', content: newLines[i], newLine: i + 1 });
    }
  }

  return lines;
}

export function CodeDiffViewer({
  oldCode,
  newCode,
  comments = [],
  fileName,
  className,
}: CodeDiffViewerProps) {
  const diffLines = generateDiffLines(oldCode, newCode);
  const hasDiff = diffLines.some((line) => line.type !== 'context');

  if (!oldCode && !newCode) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileCode className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-sm text-muted-foreground">No code changes to display</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      {fileName && (
        <CardHeader className="py-3 px-4 border-b">
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            {fileName}
          </CardTitle>
        </CardHeader>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <tbody>
            {diffLines.map((line, idx) => (
              <tr
                key={idx}
                className={cn(
                  'hover:bg-muted/50 transition-colors',
                  line.type === 'add' && 'bg-green-500/5',
                  line.type === 'remove' && 'bg-red-500/5',
                )}
              >
                <td className="w-12 text-right text-muted-foreground select-none px-2 py-0.5 border-r border-border/50">
                  {line.oldLine || ''}
                </td>
                <td className="w-12 text-right text-muted-foreground select-none px-2 py-0.5 border-r border-border/50">
                  {line.newLine || ''}
                </td>
                <td className="w-8 text-center select-none px-1 py-0.5">
                  {line.type === 'add' ? (
                    <Plus className="h-3 w-3 text-green-500 inline" />
                  ) : line.type === 'remove' ? (
                    <Minus className="h-3 w-3 text-red-500 inline" />
                  ) : (
                    <span className="text-muted-foreground"> </span>
                  )}
                </td>
                <td className={cn(
                  'px-4 py-0.5 whitespace-pre',
                  line.type === 'add' && 'text-green-600 dark:text-green-400',
                  line.type === 'remove' && 'text-red-600 dark:text-red-400',
                )}>
                  {line.content}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

import { CardContent } from '@/components/ui/card';

