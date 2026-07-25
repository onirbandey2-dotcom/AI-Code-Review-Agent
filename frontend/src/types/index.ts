// ──────────────────────────────────────────────
// Enums
// ──────────────────────────────────────────────

export type UserRole = 'admin' | 'developer' | 'reviewer' | 'viewer';

export type ReviewStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

export type ReviewDecision = 'approved' | 'changes_requested' | 'commented' | 'dismissed';

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type FindingCategory =
  | 'sql_injection'
  | 'xss'
  | 'command_injection'
  | 'hardcoded_secret'
  | 'weak_cryptography'
  | 'unsafe_deserialization'
  | 'race_condition'
  | 'memory_leak'
  | 'broken_authentication'
  | 'path_traversal'
  | 'idor'
  | 'security_misconfiguration'
  | 'unvalidated_redirect'
  | 'insecure_dependency'
  | 'ssrf'
  | 'improper_error_handling'
  | 'code_smell'
  | 'complexity'
  | 'duplication'
  | 'performance'
  | 'best_practice';

export type RepositoryProvider = 'github' | 'gitlab' | 'bitbucket' | 'self_hosted';

// ──────────────────────────────────────────────
// User Models
// ──────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  role: UserRole;
  is_active: boolean;
  is_email_verified: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface GitHubAccount {
  id: string;
  user_id: string;
  github_id: number;
  github_login: string;
  is_primary: boolean;
  created_at: string;
}

// ──────────────────────────────────────────────
// Auth Models
// ──────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  username: string;
  display_name?: string;
}

export interface SignUpResponse {
  message: string;
  user: User;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface AuthResponse {
  message: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

// ──────────────────────────────────────────────
// Repository Models
// ──────────────────────────────────────────────

export interface Repository {
  id: string;
  owner_id: string;
  name: string;
  full_name: string;
  description?: string;
  provider: RepositoryProvider;
  provider_repo_id?: string;
  clone_url: string;
  default_branch: string;
  is_private: boolean;
  is_active: boolean;
  language?: string;
  topics: string[];
  metadata: Record<string, unknown>;
  last_synced_at?: string;
  created_at: string;
  updated_at: string;
  owner?: User;
  pull_request_count?: number;
  open_issue_count?: number;
}

export interface PullRequest {
  id: string;
  repository_id: string;
  provider_pr_id?: string;
  title: string;
  description?: string;
  source_branch: string;
  target_branch: string;
  commit_sha?: string;
  author: string;
  state: string;
  is_merged: boolean;
  additions: number;
  deletions: number;
  changed_files: number;
  labels: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  repository?: Repository;
}

// ──────────────────────────────────────────────
// Review Models
// ──────────────────────────────────────────────

export interface Review {
  id: string;
  pull_request_id: string;
  reviewer_id?: string;
  status: ReviewStatus;
  decision?: ReviewDecision;
  risk_score?: number;
  summary?: string;
  total_issues: number;
  critical_issues: number;
  major_issues: number;
  minor_issues: number;
  security_issues: number;
  quality_issues: number;
  ai_confidence_score?: number;
  is_automatic: boolean;
  completed_at?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  pull_request?: PullRequest;
  comments?: ReviewComment[];
}

export interface ReviewComment {
  id: string;
  review_id: string;
  file_path: string;
  line_start: number;
  line_end?: number;
  severity: string;
  category: string;
  rule_id?: string;
  title: string;
  description: string;
  suggestion?: string;
  ai_explanation?: string;
  ai_confidence?: number;
  original_code?: string;
  suggested_code?: string;
  is_resolved: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ──────────────────────────────────────────────
// Analysis Models
// ──────────────────────────────────────────────

export interface SecurityFinding {
  id: string;
  review_id: string;
  category: FindingCategory;
  severity: SeverityLevel;
  cwe_id?: string;
  owasp_category?: string;
  file_path: string;
  line_start: number;
  line_end?: number;
  vulnerable_code?: string;
  description: string;
  impact?: string;
  remediation?: string;
  evidence?: Record<string, unknown>;
  cvss_score?: number;
  is_false_positive: boolean;
  created_at: string;
}

export interface QualityReport {
  id: string;
  review_id: string;
  overall_score: number;
  maintainability_index?: number;
  technical_debt_ratio?: number;
  total_lines: number;
  total_functions: number;
  total_classes: number;
  comment_ratio?: number;
  duplication_percentage?: number;
  test_coverage?: number;
  issues: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ComplexityMetric {
  id: string;
  review_id: string;
  file_path: string;
  function_name: string;
  line_start: number;
  line_end: number;
  cyclomatic_complexity: number;
  cognitive_complexity?: number;
  nesting_depth: number;
  lines_of_code: number;
  parameters_count: number;
  return_points: number;
  is_excessive: boolean;
  created_at: string;
}

export interface DuplicateBlock {
  id: string;
  review_id: string;
  file_path_1: string;
  start_line_1: number;
  end_line_1: number;
  file_path_2: string;
  start_line_2: number;
  end_line_2: number;
  similarity_percentage: number;
  lines_count: number;
  tokens?: Record<string, unknown>;
  created_at: string;
}

export interface CodeSmell {
  id: string;
  review_id: string;
  smell_type: string;
  file_path: string;
  line_start: number;
  line_end?: number;
  severity: SeverityLevel;
  description: string;
  suggestion?: string;
  effort_hours?: number;
  created_at: string;
}

// ──────────────────────────────────────────────
// Chat Models
// ──────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  repository_id?: string;
  title: string;
  is_active: boolean;
  messages?: ChatMessage[];
  created_at: string;
  updated_at: string;
}

// ──────────────────────────────────────────────
// Dashboard Models
// ──────────────────────────────────────────────

export interface DashboardMetrics {
  total_repositories: number;
  total_pull_requests: number;
  total_reviews: number;
  total_security_findings: number;
  average_risk_score: number;
  average_quality_score: number;
  reviews_by_status: Record<string, number>;
  findings_by_severity: Record<string, number>;
  recent_reviews: Review[];
  recent_findings: SecurityFinding[];
  top_issues: { category: string; count: number }[];
  activity_data: { date: string; reviews: number; findings: number }[];
}

// ──────────────────────────────────────────────
// API Response Types
// ──────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, unknown>;
  path?: string;
}

export interface ApiSuccess<T> {
  data: T;
  message?: string;
}

// ──────────────────────────────────────────────
// Code Explorer Types
// ──────────────────────────────────────────────

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  language?: string;
  size?: number;
}

export interface FileContent {
  path: string;
  content: string;
  language: string;
  size: number;
  lines: number;
}

