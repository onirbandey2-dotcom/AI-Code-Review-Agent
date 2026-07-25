import apiClient from '@/lib/axios';
import type {
  LoginResponse,
  LoginCredentials,
  SignUpData,
  SignUpResponse,
  ForgotPasswordData,
  ResetPasswordData,
  AuthResponse,
  User,
} from '@/types';

export const authApi = {
  // ── Email/Password Auth ──
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  signUp: async (data: SignUpData): Promise<SignUpResponse> => {
    const response = await apiClient.post<SignUpResponse>('/auth/signup', data);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/reset-password', data);
    return response.data;
  },

  // ── GitHub OAuth ──
  loginWithGithub: async (code: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/github', { code });
    return response.data;
  },

  getGithubAuthUrl: async (): Promise<{ url: string }> => {
    const response = await apiClient.get<{ url: string }>('/auth/github/url');
    return response.data;
  },

  // ── Shared ──
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  refreshToken: async (refreshTokenStr: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/refresh', {
      refresh_token: refreshTokenStr,
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};

