import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ErrorBoundary } from '@/components/features/ErrorBoundary';
import { useAuthContext } from '@/contexts/AuthContext';
import { getInitials, formatDate } from '@/lib/utils';
import {
  User,
  Mail,
  Calendar,
  Shield,
  Github,
  Edit3,
  ArrowLeft,
} from 'lucide-react';

export function Profile() {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  if (!user) {
    return null;
  }

  return (
    <div className="page-container max-w-4xl">
      <ErrorBoundary>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatar_url} alt={user.display_name || user.username} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {getInitials(user.display_name || user.username)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">
                      {user.display_name || user.username}
                    </h1>
                    <p className="text-muted-foreground">@{user.username}</p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Edit3 className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>
                {user.bio && (
                  <p className="mt-2 text-sm text-muted-foreground">{user.bio}</p>
                )}
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Joined {formatDate(user.created_at)}
                  </div>
                  <Badge
                    variant="outline"
                    className="capitalize"
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    {user.role}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Your account information and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Display Name</label>
                <p className="mt-1">{user.display_name || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Username</label>
                <p className="mt-1">@{user.username}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="mt-1">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Role</label>
                <p className="mt-1 capitalize">{user.role}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email Verified</label>
                <p className="mt-1">
                  <Badge variant={user.is_email_verified ? 'success' : 'warning'}>
                    {user.is_email_verified ? 'Verified' : 'Not Verified'}
                  </Badge>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Account Status</label>
                <p className="mt-1">
                  <Badge variant={user.is_active ? 'success' : 'destructive'}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Connected Accounts</h3>
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <Github className="h-5 w-5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">GitHub</p>
                  <p className="text-xs text-muted-foreground">Connected</p>
                </div>
                <Badge variant="success">Connected</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </ErrorBoundary>
    </div>
  );
}
