import apiClient from '@/lib/axios';
import type {
  SecurityFinding,
  QualityReport,
  ComplexityMetric,
  DuplicateBlock,
  CodeSmell,
  PaginatedResponse,
} from '@/types';

export const analysisApi = {
  // Security Findings
  getSecurityFindings: async (
    reviewId: string,
  ): Promise<SecurityFinding[]> => {
    const response = await apiClient.get<SecurityFinding[]>(
      `/analysis/${reviewId}/security`,
    );
    return response.data;
  },

  listSecurityFindings: async (params?: {
    page?: number;
    size?: number;
    severity?: string;
    category?: string;
  }): Promise<PaginatedResponse<SecurityFinding>> => {
    const response = await apiClient.get<PaginatedResponse<SecurityFinding>>(
      '/analysis/security',
      { params },
    );
    return response.data;
  },

  // Quality Reports
  getQualityReport: async (reviewId: string): Promise<QualityReport> => {
    const response = await apiClient.get<QualityReport>(
      `/analysis/${reviewId}/quality`,
    );
    return response.data;
  },

  // Complexity Metrics
  getComplexityMetrics: async (reviewId: string): Promise<ComplexityMetric[]> => {
    const response = await apiClient.get<ComplexityMetric[]>(
      `/analysis/${reviewId}/complexity`,
    );
    return response.data;
  },

  // Duplicate Blocks
  getDuplicateBlocks: async (reviewId: string): Promise<DuplicateBlock[]> => {
    const response = await apiClient.get<DuplicateBlock[]>(
      `/analysis/${reviewId}/duplications`,
    );
    return response.data;
  },

  // Code Smells
  getCodeSmells: async (reviewId: string): Promise<CodeSmell[]> => {
    const response = await apiClient.get<CodeSmell[]>(
      `/analysis/${reviewId}/code-smells`,
    );
    return response.data;
  },

  // Run Analysis
  runSecurityAnalysis: async (reviewId: string): Promise<{ task_id: string }> => {
    const response = await apiClient.post<{ task_id: string }>(
      `/analysis/${reviewId}/security/run`,
    );
    return response.data;
  },

  runQualityAnalysis: async (reviewId: string): Promise<{ task_id: string }> => {
    const response = await apiClient.post<{ task_id: string }>(
      `/analysis/${reviewId}/quality/run`,
    );
    return response.data;
  },
};

