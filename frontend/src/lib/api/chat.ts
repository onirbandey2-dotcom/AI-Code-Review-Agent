import apiClient from '@/lib/axios';
import type { ChatSession, ChatMessage } from '@/types';

export const chatApi = {
  listSessions: async (): Promise<ChatSession[]> => {
    const response = await apiClient.get<ChatSession[]>('/chat/sessions');
    return response.data;
  },

  getSession: async (sessionId: string): Promise<ChatSession> => {
    const response = await apiClient.get<ChatSession>(`/chat/sessions/${sessionId}`);
    return response.data;
  },

  createSession: async (data: {
    repository_id?: string;
    title?: string;
  }): Promise<ChatSession> => {
    const response = await apiClient.post<ChatSession>('/chat/sessions', data);
    return response.data;
  },

  deleteSession: async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/chat/sessions/${sessionId}`);
  },

  getMessages: async (sessionId: string): Promise<ChatMessage[]> => {
    const response = await apiClient.get<ChatMessage[]>(
      `/chat/sessions/${sessionId}/messages`,
    );
    return response.data;
  },

  sendMessage: async (
    sessionId: string,
    content: string,
  ): Promise<ChatMessage> => {
    const response = await apiClient.post<ChatMessage>(
      `/chat/sessions/${sessionId}/messages`,
      { content },
    );
    return response.data;
  },

  streamMessage: (
    sessionId: string,
    content: string,
    onChunk: (chunk: string) => void,
    onDone: () => void,
    onError: (error: Error) => void,
  ): AbortController => {
    const controller = new AbortController();

    fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/chat/sessions/${sessionId}/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ content }),
        signal: controller.signal,
      },
    )
      .then(async (response) => {
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No reader available');

        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            onDone();
            break;
          }
          const chunk = decoder.decode(value);
          onChunk(chunk);
        }
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          onError(error);
        }
      });

    return controller;
  },
};

