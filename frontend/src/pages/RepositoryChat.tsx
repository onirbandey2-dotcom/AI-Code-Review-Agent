import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ErrorBoundary } from '@/components/features/ErrorBoundary';
import { ChatInterface } from '@/components/features/ChatInterface';
import { useQuery, useMutation } from '@tanstack/react-query';
import { chatApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import {
  MessageSquare,
  Plus,
  Trash2,
  Loader2,
  Bot,
} from 'lucide-react';
import type { ChatMessage } from '@/types';

export function RepositoryChat() {
  const navigate = useNavigate();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: chatApi.listSessions,
  });

  const { data: sessionMessages, refetch: refetchMessages } = useQuery({
    queryKey: ['chat-messages', activeSessionId],
    queryFn: () => chatApi.getMessages(activeSessionId || ''),
    enabled: !!activeSessionId,
  });

  useEffect(() => {
    if (sessionMessages) {
      setMessages(sessionMessages);
    }
  }, [sessionMessages]);

  const createSessionMutation = useMutation({
    mutationFn: () => chatApi.createSession({ title: 'New Chat' }),
    onSuccess: (session) => {
      setActiveSessionId(session.id);
      setMessages([]);
      toast({ title: 'New chat session created', variant: 'success' });
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: string) => chatApi.deleteSession(sessionId),
    onSuccess: () => {
      if (activeSessionId === deleteSessionMutation.variables) {
        setActiveSessionId(null);
        setMessages([]);
      }
      toast({ title: 'Chat session deleted', variant: 'success' });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ sessionId, content }: { sessionId: string; content: string }) =>
      chatApi.sendMessage(sessionId, content),
    onSuccess: (message) => {
      setMessages((prev) => [...prev, message]);
      refetchMessages();
    },
  });

  const handleSendMessage = async (content: string) => {
    let sessionId = activeSessionId;

    if (!sessionId) {
      try {
        const session = await createSessionMutation.mutateAsync();
        sessionId = session.id;
      } catch {
        return;
      }
    }

    // Add user message optimistically
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      session_id: sessionId,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    // Send message
    sendMessageMutation.mutate({ sessionId, content });
  };

  return (
    <div className="page-container h-[calc(100vh-4rem)]">
      <ErrorBoundary>
        <div className="flex gap-6 h-full">
          {/* Sessions Sidebar */}
          <div className="w-72 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Chat History</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => createSessionMutation.mutate()}
                disabled={createSessionMutation.isPending}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {sessionsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : sessions?.length === 0 ? (
                <div className="text-center py-8">
                  <Bot className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No chat sessions</p>
                </div>
              ) : (
                sessions?.map((session) => (
                  <div
                    key={session.id}
                    className={`
                      flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors
                      ${activeSessionId === session.id ? 'bg-accent' : 'hover:bg-accent/50'}
                    `}
                    onClick={() => setActiveSessionId(session.id)}
                  >
                    <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{session.title || 'Untitled'}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSessionMutation.mutate(session.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            <Card className="flex-1 overflow-hidden">
              <ChatInterface
                messages={messages}
                isLoading={sendMessageMutation.isPending}
                isStreaming={isStreaming}
                onSendMessage={handleSendMessage}
              />
            </Card>
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
}
