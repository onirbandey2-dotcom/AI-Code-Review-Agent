import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ErrorBoundary } from '@/components/features/ErrorBoundary';
import { MonacoCodeEditor } from '@/components/features/MonacoCodeEditor';
import { useQuery } from '@tanstack/react-query';
import { repositoriesApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import {
  FileCode,
  Folder,
  File,
  ChevronRight,
  ChevronDown,
  Search,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { cn, getLanguageFromPath } from '@/lib/utils';
import type { FileNode } from '@/types';

function FileTreeItem({
  node,
  level = 0,
  selectedPath,
  onSelect,
}: {
  node: FileNode;
  level?: number;
  selectedPath?: string;
  onSelect: (path: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isSelected = selectedPath === node.path;
  const hasChildren = node.type === 'directory' && node.children && node.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded-md transition-colors',
          'hover:bg-accent/50',
          isSelected && 'bg-accent text-accent-foreground',
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => {
          if (hasChildren) {
            setExpanded(!expanded);
          } else {
            onSelect(node.path);
          }
        }}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          )
        ) : (
          <span className="w-4" />
        )}
        {node.type === 'directory' ? (
          expanded ? (
            <Folder className="h-4 w-4 text-blue-500 shrink-0" />
          ) : (
            <Folder className="h-4 w-4 text-yellow-500 shrink-0" />
          )
        ) : (
          <FileCode className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        <span className="truncate">{node.name}</span>
      </div>
      {expanded && node.children?.map((child) => (
        <FileTreeItem
          key={child.path}
          node={child}
          level={level + 1}
          selectedPath={selectedPath}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

export function CodeExplorer() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRepoId, setSelectedRepoId] = useState<string>('sample-repo');
  const [selectedFilePath, setSelectedFilePath] = useState<string>('');

  const { data: repos } = useQuery({
    queryKey: ['repositories'],
    queryFn: () => repositoriesApi.list(),
  });

  const { data: fileTree, isLoading: treeLoading } = useQuery({
    queryKey: ['file-tree', selectedRepoId],
    queryFn: () => repositoriesApi.getFileTree(selectedRepoId),
    enabled: !!selectedRepoId,
  });

  const { data: fileContent, isLoading: contentLoading } = useQuery({
    queryKey: ['file-content', selectedRepoId, selectedFilePath],
    queryFn: () => repositoriesApi.getFileContent(selectedRepoId, selectedFilePath),
    enabled: !!selectedRepoId && !!selectedFilePath,
  });

  return (
    <div className="page-container h-[calc(100vh-4rem)]">
      <ErrorBoundary>
        <div className="flex gap-6 h-full">
          {/* File Tree */}
          <div className="w-72 shrink-0 flex flex-col">
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Code Explorer</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-8 text-sm"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              {treeLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : fileTree?.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No files found
                </div>
              ) : (
                fileTree?.map((node) => (
                  <FileTreeItem
                    key={node.path}
                    node={node}
                    selectedPath={selectedFilePath}
                    onSelect={setSelectedFilePath}
                  />
                ))
              )}
            </ScrollArea>
          </div>

          {/* Code View */}
          <div className="flex-1 flex flex-col">
            {contentLoading ? (
              <div className="flex items-center justify-center flex-1">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : fileContent ? (
              <MonacoCodeEditor
                value={fileContent.content}
                language={getLanguageFromPath(fileContent.path)}
                path={fileContent.path}
                height="100%"
                minimap
              />
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <FileCode className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Select a file</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose a file from the explorer to view its contents
                </p>
              </div>
            )}
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
}
