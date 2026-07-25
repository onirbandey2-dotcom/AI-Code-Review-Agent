import apiClient from '@/lib/axios';
import type { DashboardMetrics } from '@/types';

export const dashboardApi = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    const response = await apiClient.get<DashboardMetrics>('/dashboard/metrics');
    return response.data;
  },

  getActivityData: async (days?: number): Promise<{ date: string; reviews: number; findings: number }[]> => {
    const response = await apiClient.get<{ date: string; reviews: number; findings: number }[]>(
      '/dashboard/activity',
      { params: { days } },
    );
    return response.data;
  },
};

