import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { repositoriesApi } from '@/lib/api';
import type { Repository } from '@/types';

export function useRepositories(params?: {
  page?: number;
  size?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: ['repositories', params],
    queryFn: () => repositoriesApi.list(params),
  });
}

export function useRepository(id: string) {
  return useQuery({
    queryKey: ['repository', id],
    queryFn: () => repositoriesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateRepository() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      full_name: string;
      clone_url: string;
      provider?: string;
      description?: string;
      is_private?: boolean;
    }) => repositoriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repositories'] });
    },
  });
}

export function useDeleteRepository() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repositoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repositories'] });
    },
  });
}

export function useSyncRepository() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repositoriesApi.sync(id),
    onSuccess: (data: Repository) => {
      queryClient.invalidateQueries({ queryKey: ['repository', data.id] });
      queryClient.invalidateQueries({ queryKey: ['repositories'] });
    },
  });
}

export function usePullRequests(
  repositoryId: string,
  params?: { page?: number; size?: number; state?: string },
) {
  return useQuery({
    queryKey: ['pull-requests', repositoryId, params],
    queryFn: () => repositoriesApi.listPullRequests(repositoryId, params),
    enabled: !!repositoryId,
  });
}

export function useFileTree(repositoryId: string, branch?: string) {
  return useQuery({
    queryKey: ['file-tree', repositoryId, branch],
    queryFn: () => repositoriesApi.getFileTree(repositoryId, branch),
    enabled: !!repositoryId,
  });
}

export function useFileContent(repositoryId: string, filePath: string, branch?: string) {
  return useQuery({
    queryKey: ['file-content', repositoryId, filePath, branch],
    queryFn: () => repositoriesApi.getFileContent(repositoryId, filePath, branch),
    enabled: !!repositoryId && !!filePath,
  });
}

