import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '@/lib/api';

export function useReviews(params?: {
  page?: number;
  size?: number;
  status?: string;
  repository_id?: string;
}) {
  return useQuery({
    queryKey: ['reviews', params],
    queryFn: () => reviewsApi.list(params),
  });
}

export function useReview(id: string) {
  return useQuery({
    queryKey: ['review', id],
    queryFn: () => reviewsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { pull_request_id: string; is_automatic?: boolean }) =>
      reviewsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

export function useReviewComments(reviewId: string) {
  return useQuery({
    queryKey: ['review-comments', reviewId],
    queryFn: () => reviewsApi.getComments(reviewId),
    enabled: !!reviewId,
  });
}

export function useResolveComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => reviewsApi.resolveComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-comments'] });
    },
  });
}

