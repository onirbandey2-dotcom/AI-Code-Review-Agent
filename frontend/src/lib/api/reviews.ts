import apiClient from '@/lib/axios';
import type { Review, ReviewComment, PaginatedResponse } from '@/types';

export const reviewsApi = {
  list: async (params?: {
    page?: number;
    size?: number;
    status?: string;
    repository_id?: string;
  }): Promise<PaginatedResponse<Review>> => {
    const response = await apiClient.get<PaginatedResponse<Review>>('/reviews', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Review> => {
    const response = await apiClient.get<Review>(`/reviews/${id}`);
    return response.data;
  },

  create: async (data: {
    pull_request_id: string;
    is_automatic?: boolean;
  }): Promise<Review> => {
    const response = await apiClient.post<Review>('/reviews', data);
    return response.data;
  },

  getComments: async (reviewId: string): Promise<ReviewComment[]> => {
    const response = await apiClient.get<ReviewComment[]>(`/reviews/${reviewId}/comments`);
    return response.data;
  },

  resolveComment: async (commentId: string): Promise<ReviewComment> => {
    const response = await apiClient.patch<ReviewComment>(`/reviews/comments/${commentId}/resolve`);
    return response.data;
  },

  getByPullRequest: async (pullRequestId: string): Promise<Review[]> => {
    const response = await apiClient.get<Review[]>('/reviews', {
      params: { pull_request_id: pullRequestId },
    });
    return response.data;
  },
};

