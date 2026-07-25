import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analysisApi } from '@/lib/api';

export function useSecurityFindings(reviewId: string) {
  return useQuery({
    queryKey: ['security-findings', reviewId],
    queryFn: () => analysisApi.getSecurityFindings(reviewId),
    enabled: !!reviewId,
  });
}

export function useAllSecurityFindings(params?: {
  page?: number;
  size?: number;
  severity?: string;
  category?: string;
}) {
  return useQuery({
    queryKey: ['all-security-findings', params],
    queryFn: () => analysisApi.listSecurityFindings(params),
  });
}

export function useQualityReport(reviewId: string) {
  return useQuery({
    queryKey: ['quality-report', reviewId],
    queryFn: () => analysisApi.getQualityReport(reviewId),
    enabled: !!reviewId,
  });
}

export function useComplexityMetrics(reviewId: string) {
  return useQuery({
    queryKey: ['complexity-metrics', reviewId],
    queryFn: () => analysisApi.getComplexityMetrics(reviewId),
    enabled: !!reviewId,
  });
}

export function useDuplicateBlocks(reviewId: string) {
  return useQuery({
    queryKey: ['duplicate-blocks', reviewId],
    queryFn: () => analysisApi.getDuplicateBlocks(reviewId),
    enabled: !!reviewId,
  });
}

export function useCodeSmells(reviewId: string) {
  return useQuery({
    queryKey: ['code-smells', reviewId],
    queryFn: () => analysisApi.getCodeSmells(reviewId),
    enabled: !!reviewId,
  });
}

export function useRunSecurityAnalysis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => analysisApi.runSecurityAnalysis(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-findings'] });
    },
  });
}

export function useRunQualityAnalysis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => analysisApi.runQualityAnalysis(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quality-report'] });
    },
  });
}

