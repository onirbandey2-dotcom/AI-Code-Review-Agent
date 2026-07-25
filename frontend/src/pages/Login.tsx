import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Github, Code2, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Handle OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      toast({
        title: 'Authentication failed',
        description: error,
        variant: 'destructive',
      });
      return;
    }

    if (code) {
      setIsLoading(true);
      authApi
        .loginWithGithub(code)
        .then((response) => {
          login(response);
          toast({
            title: 'Welcome to CodeSage AI',
            description: 'Successfully logged in with GitHub',
            variant: 'success',
          });
          navigate('/dashboard', { replace: true });
        })
        .catch((err) => {
          toast({
            title: 'Login failed',
            description: err?.response?.data?.message || 'Could not authenticate with GitHub',
            variant: 'destructive',
          });
        })
        .finally(() => {
          setIsLoading(false);
          window.history.replaceState({}, document.title, '/login');
        });
    }
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Please fill in all fields', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      login(response);
      toast({
        title: 'Welcome back!',
        description: 'Successfully logged in',
        variant: 'success',
      });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      toast({
        title: 'Login failed',
        description: err?.response?.data?.message || 'Invalid email or password',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setIsLoading(true);
    try {
      const { url } = await authApi.getGithubAuthUrl();
      window.location.href = url;
    } catch (err) {
      toast({
        title: 'Failed to initialize login',
        description: 'Could not connect to GitHub. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <Card className="relative w-full max-w-md glass border-primary/20">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
              <Code2 className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Welcome to{' '}
            <span className="gradient-text">CodeSage AI</span>
          </CardTitle>
          <CardDescription className="text-base">
            Sign in with your email or GitHub account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={isLoading} size="lg" className="w-full h-11 gap-2">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              {isLoading ? 'Signing in...' : 'Sign in with Email'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* GitHub OAuth */}
          <Button
            onClick={handleGithubLogin}
            disabled={isLoading}
            variant="outline"
            size="lg"
            className="w-full h-11 gap-3"
          >
            <Github className="h-5 w-5" />
            Continue with GitHub
          </Button>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Create one
            </Link>
          </p>

          {/* Footer */}
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { icon: '🔍', label: 'Smart Reviews' },
              { icon: '🛡️', label: 'Security' },
              { icon: '🤖', label: 'AI Chat' },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="text-xl">{item.icon}</div>
                <p className="text-[10px] text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to CodeSage AI's{' '}
            <a href="#" className="underline hover:text-primary">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-primary">
              Privacy Policy
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

