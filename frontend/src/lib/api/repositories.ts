import apiClient from '@/lib/axios';
import type { Repository, PullRequest, PaginatedResponse, FileNode, FileContent } from '@/types';

export const repositoriesApi = {
  list: async (params?: {
    page?: number;
    size?: number;
    search?: string;
    provider?: string;
  }): Promise<PaginatedResponse<Repository>> => {
    const response = await apiClient.get<PaginatedResponse<Repository>>('/repositories', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Repository> => {
    const response = await apiClient.get<Repository>(`/repositories/${id}`);
    return response.data;
  },

  create: async (data: {
    name: string;
    full_name: string;
    clone_url: string;
    provider?: string;
    description?: string;
    is_private?: boolean;
  }): Promise<Repository> => {
    const response = await apiClient.post<Repository>('/repositories', data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/repositories/${id}`);
  },

  sync: async (id: string): Promise<Repository> => {
    const response = await apiClient.post<Repository>(`/repositories/${id}/sync`);
    return response.data;
  },

  listPullRequests: async (
    repositoryId: string,
    params?: { page?: number; size?: number; state?: string },
  ): Promise<PaginatedResponse<PullRequest>> => {
    const response = await apiClient.get<PaginatedResponse<PullRequest>>(
      `/repositories/${repositoryId}/pull-requests`,
      { params },
    );
    return response.data;
  },

  getFileTree: async (repositoryId: string, branch?: string): Promise<FileNode[]> => {
    const response = await apiClient.get<FileNode[]>(
      `/repositories/${repositoryId}/files`,
      { params: { branch } },
    );
    return response.data;
  },

  getFileContent: async (
    repositoryId: string,
    filePath: string,
    branch?: string,
  ): Promise<FileContent> => {
    const response = await apiClient.get<FileContent>(
      `/repositories/${repositoryId}/files/content`,
      { params: { path: filePath, branch } },
    );
    return response.data;
  },

  searchRepositories: async (query: string): Promise<Repository[]> => {
    const response = await apiClient.get<Repository[]>('/repositories/search', {
      params: { q: query },
    });
    return response.data;
  },
};

