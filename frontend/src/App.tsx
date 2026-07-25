import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

// Pages
import { Login } from '@/pages/Login';
import { SignUp } from '@/pages/SignUp';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { Dashboard } from '@/pages/Dashboard';
import { Repositories } from '@/pages/Repositories';
import { PullRequestReview } from '@/pages/PullRequestReview';
import { ReviewResults } from '@/pages/ReviewResults';
import { SecurityFindings } from '@/pages/SecurityFindings';
import { RepositoryChat } from '@/pages/RepositoryChat';
import { CodeExplorer } from '@/pages/CodeExplorer';
import { Settings } from '@/pages/Settings';
import { Profile } from '@/pages/Profile';
import { NotFound } from '@/pages/NotFound';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/repositories" element={<Repositories />} />
        <Route path="/repositories/:id" element={<Repositories />} />
        <Route path="/reviews" element={<PullRequestReview />} />
        <Route path="/reviews/:id" element={<PullRequestReview />} />
        <Route path="/reviews/:reviewId/results" element={<ReviewResults />} />
        <Route path="/security" element={<SecurityFindings />} />
        <Route path="/chat" element={<RepositoryChat />} />
        <Route path="/explorer" element={<CodeExplorer />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Root Redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;

