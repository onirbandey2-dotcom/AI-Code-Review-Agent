import { useCallback, useRef } from 'react';
import Editor, { OnMount, BeforeMount, Monaco } from '@monaco-editor/react';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface MonacoCodeEditorProps {
  value: string;
  language?: string;
  path?: string;
  onChange?: (value: string | undefined) => void;
  readOnly?: boolean;
  height?: string | number;
  minimap?: boolean;
  lineNumbers?: 'on' | 'off' | 'relative';
  className?: string;
}

export function MonacoCodeEditor({
  value,
  language = 'typescript',
  path,
  onChange,
  readOnly = true,
  height = '500px',
  minimap = true,
  lineNumbers = 'on',
  className,
}: MonacoCodeEditorProps) {
  const { theme } = useTheme();
  const monacoRef = useRef<Monaco | null>(null);

  const handleBeforeMount: BeforeMount = useCallback((monaco: Monaco) => {
    monacoRef.current = monaco;

    // Define custom theme
    monaco.editor.defineTheme('codesage-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6B7280', fontStyle: 'italic' },
        { token: 'keyword', foreground: '818CF8' },
        { token: 'string', foreground: '34D399' },
        { token: 'number', foreground: 'FBBF24' },
        { token: 'type', foreground: '60A5FA' },
        { token: 'function', foreground: 'A78BFA' },
        { token: 'variable', foreground: 'FCA5A5' },
      ],
      colors: {
        'editor.background': '#0f172a',
        'editor.foreground': '#e2e8f0',
        'editor.lineHighlightBackground': '#1e293b',
        'editor.selectionBackground': '#334155',
        'editor.inactiveSelectionBackground': '#1e293b',
        'editorCursor.foreground': '#818CF8',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#94a3b8',
        'editor.selectionHighlightBackground': '#334155',
        'editorBracketMatch.background': '#334155',
        'editorBracketMatch.border': '#818CF8',
        'scrollbar.shadow': '#00000033',
        'scrollbarSlider.background': '#47556980',
        'scrollbarSlider.hoverBackground': '#64748b80',
        'scrollbarSlider.activeBackground': '#94a3b880',
      },
    });

    monaco.editor.defineTheme('codesage-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6B7280', fontStyle: 'italic' },
        { token: 'keyword', foreground: '6366F1' },
        { token: 'string', foreground: '059669' },
        { token: 'number', foreground: 'D97706' },
        { token: 'type', foreground: '2563EB' },
        { token: 'function', foreground: '7C3AED' },
        { token: 'variable', foreground: 'DC2626' },
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#1e293b',
        'editor.lineHighlightBackground': '#f1f5f9',
        'editor.selectionBackground': '#dbeafe',
        'editorCursor.foreground': '#6366F1',
        'editorLineNumber.foreground': '#94a3b8',
        'editorLineNumber.activeForeground': '#475569',
        'scrollbar.shadow': '#0000001a',
        'scrollbarSlider.background': '#cbd5e180',
        'scrollbarSlider.hoverBackground': '#94a3b880',
      },
    });
  }, []);

  const handleMount: OnMount = useCallback((editor) => {
    // Add extra actions if needed
  }, []);

  return (
    <div className={cn('overflow-hidden rounded-lg border', className)}>
      <Editor
        height={height}
        language={language}
        value={value}
        path={path}
        onChange={onChange}
        onMount={handleMount}
        beforeMount={handleBeforeMount}
        theme={theme === 'dark' ? 'codesage-dark' : 'codesage-light'}
        options={{
          readOnly,
          minimap: { enabled: minimap },
          lineNumbers,
          fontSize: 13,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontLigatures: true,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          tabSize: 2,
          automaticLayout: true,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          bracketPairColorization: { enabled: true },
          renderLineHighlight: 'all',
          padding: { top: 12, bottom: 12 },
          lineHeight: 22,
          folding: true,
          foldingHighlight: true,
          foldingStrategy: 'indentation',
          showFoldingControls: 'always',
          renderWhitespace: 'selection',
          renderControlCharacters: false,
          contextmenu: true,
          quickSuggestions: false,
          suggestOnTriggerCharacters: false,
          parameterHints: { enabled: false },
          occurrencesHighlight: 'off',
          selectionHighlight: false,
          codeLens: false,
          glyphMargin: false,
          foldingDecorations: 'always',
        }}
        loading={
          <div className="flex items-center justify-center p-8">
            <div className="space-y-3 w-full">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[80%]" />
              <Skeleton className="h-4 w-[70%]" />
            </div>
          </div>
        }
      />
    </div>
  );
}
