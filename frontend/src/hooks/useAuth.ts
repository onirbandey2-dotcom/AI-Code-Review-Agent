import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, dashboardApi } from '@/lib/api';
import { useAuthContext } from '@/contexts/AuthContext';
import type { LoginCredentials, SignUpData, ForgotPasswordData } from '@/types';

export function useUser() {
  const { user, updateUser } = useAuthContext();

  const query = useQuery({
    queryKey: ['user'],
    queryFn: authApi.getMe,
    enabled: !!localStorage.getItem('access_token'),
    staleTime: 5 * 60 * 1000,
  });

  // Sync context with query data
  if (query.data && (!user || query.data.id !== user.id)) {
    updateUser(query.data);
  }

  return {
    user: query.data || user,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useGithubLogin() {
  const { login } = useAuthContext();

  return useMutation({
    mutationFn: (code: string) => authApi.loginWithGithub(code),
    onSuccess: (data) => {
      login(data);
    },
  });
}

export function useEmailLogin() {
  const { login } = useAuthContext();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      login(data);
    },
  });
}

export function useSignUp() {
  return useMutation({
    mutationFn: (data: SignUpData) => authApi.signUp(data),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordData) => authApi.forgotPassword(data),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { logout } = useAuthContext();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      queryClient.clear();
      logout();
    },
  });
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: dashboardApi.getMetrics,
  });
}

